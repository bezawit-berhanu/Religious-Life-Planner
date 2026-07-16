
import React, { useState } from 'react';
import { CommunityPost, User, Story } from '../types';
import { Heart, MessageCircle, Share2, MoreHorizontal, PlusSquare, Search, User as UserIcon, Home, Compass, Image as ImageIcon, Video, X, Camera, Edit3, Check, Lock } from 'lucide-react';
import { MOCK_STORIES } from '../constants';

interface CommunityProps {
  posts: CommunityPost[];
  user: User;
  addPost: (content: string, image?: string, video?: string) => void;
  deletePost: (id: string) => void;
  updateUser: (user: User) => void;
}

const Community: React.FC<CommunityProps> = ({ posts, user, addPost, deletePost, updateUser }) => {
  const [activeTab, setActiveTab] = useState<'Feed' | 'Search' | 'Profile' | 'Create'>('Feed');
  
  // Post Creation
  const [newPostContent, setNewPostContent] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedVideo, setAttachedVideo] = useState<string | null>(null); // In real app, this is URL/Blob
  
  // Profile Editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editBio, setEditBio] = useState(user.bio || '');

  // Feed Filter
  const [feedFilter, setFeedFilter] = useState<'All' | 'Following'>('All');

  const handleCreatePost = () => {
      if (newPostContent.trim() || attachedImage || attachedVideo) {
          addPost(newPostContent, attachedImage || undefined, attachedVideo || undefined);
          setNewPostContent('');
          setAttachedImage(null);
          setAttachedVideo(null);
          setActiveTab('Feed');
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  if (type === 'image') setAttachedImage(ev.target.result as string);
                  if (type === 'video') setAttachedVideo(ev.target.result as string); // Simulating video blob with base64 for demo
              }
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const saveProfile = () => {
      updateUser({ ...user, name: editName, bio: editBio });
      setIsEditingProfile(false);
  };

  // Logic to follow users (Simulated by updating local user object)
  const toggleFollow = (authorId: string) => {
      const currentFollowing = user.followingIds || [];
      const isFollowing = currentFollowing.includes(authorId);
      
      let newFollowingIds;
      if (isFollowing) {
          newFollowingIds = currentFollowing.filter(id => id !== authorId);
      } else {
          newFollowingIds = [...currentFollowing, authorId];
      }
      
      updateUser({ 
          ...user, 
          followingIds: newFollowingIds, 
          following: newFollowingIds.length 
      });
  };

  // Filter posts
  const displayedPosts = activeTab === 'Feed' && feedFilter === 'Following' 
      ? posts.filter(p => user.followingIds?.includes(p.authorId) || p.authorId === user.id)
      : posts;

  const userPosts = posts.filter(p => p.authorId === user.id);

  const renderContent = () => (
    <div className="pb-20 animate-fade-in flex flex-col h-full bg-ols-bg min-h-screen">
        {/* Customized Header */}
        <div className="bg-ols-primary text-white p-4 sticky top-0 z-30 shadow-md">
             <div className="flex justify-between items-center">
                 <h2 className="font-serif text-xl font-bold tracking-wide">Community</h2>
                 <div className="flex gap-4">
                     {activeTab === 'Feed' && (
                         <div className="flex text-xs font-bold border border-white/30 rounded-lg overflow-hidden">
                             <button 
                                onClick={() => setFeedFilter('All')} 
                                className={`px-3 py-1 ${feedFilter === 'All' ? 'bg-white text-ols-primary' : 'text-white'}`}
                             >
                                 Global
                             </button>
                             <button 
                                onClick={() => setFeedFilter('Following')} 
                                className={`px-3 py-1 ${feedFilter === 'Following' ? 'bg-white text-ols-primary' : 'text-white'}`}
                             >
                                 Following
                             </button>
                         </div>
                     )}
                     <button onClick={() => setActiveTab('Create')} className="bg-ols-secondary text-ols-primary p-1 rounded-md">
                         <PlusSquare size={24} />
                     </button>
                 </div>
             </div>
        </div>

        <div className="flex-1 overflow-y-auto">
            
            {activeTab === 'Feed' && (
                <div className="space-y-6 p-4">
                    {/* Stories Rail */}
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                         <div className="flex flex-col items-center gap-1 min-w-[70px]">
                            <button className="w-16 h-16 rounded-full border-2 border-dashed border-ols-accent p-1 flex items-center justify-center bg-white hover:bg-gray-50">
                                <PlusSquare className="text-ols-accent" />
                            </button>
                            <span className="text-xs font-serif text-ols-primary">Add Story</span>
                         </div>
                         {MOCK_STORIES.map(story => (
                             <div key={story.id} className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer">
                                <div className={`w-16 h-16 rounded-full p-[3px] ${story.isViewed ? 'bg-gray-300' : 'bg-ols-secondary'}`}>
                                    <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-200">
                                        {story.type === 'video' ? (
                                            <div className="w-full h-full flex items-center justify-center bg-black text-white"><Video size={16}/></div>
                                        ) : (
                                            <img src={story.content} alt={story.user} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                </div>
                                <span className="text-xs font-serif text-ols-primary">{story.user}</span>
                             </div>
                         ))}
                    </div>

                    {/* Posts Feed */}
                    {displayedPosts.length === 0 ? (
                        <div className="text-center py-20 text-ols-muted">
                            <p>{feedFilter === 'Following' ? "You aren't following anyone yet." : "No posts yet. Be the first!"}</p>
                        </div>
                    ) : (
                        displayedPosts.map(post => (
                            <div key={post.id} className="bg-white dark:bg-ols-surface rounded-t-lg rounded-b-xl shadow-md border-t-4 border-ols-primary overflow-hidden">
                                <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-ols-bg/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-ols-primary text-white flex items-center justify-center font-bold font-serif border-2 border-ols-secondary overflow-hidden">
                                            {post.authorImage ? (
                                                <img src={post.authorImage} alt={post.authorName} className="w-full h-full object-cover" />
                                            ) : (
                                                post.authorAvatar
                                            )}
                                        </div>
                                        <div>
                                            <span className="font-bold text-ols-primary block text-sm font-serif">{post.authorName}</span>
                                            <span className="text-xs text-ols-muted">{post.timeAgo}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {post.authorId !== user.id && (
                                            <button 
                                                onClick={() => toggleFollow(post.authorId)}
                                                className={`text-xs font-bold px-3 py-1 rounded-full border ${user.followingIds?.includes(post.authorId) ? 'border-gray-300 text-gray-500' : 'border-ols-secondary text-ols-secondary hover:bg-ols-secondary/10'}`}
                                            >
                                                {user.followingIds?.includes(post.authorId) ? 'Following' : 'Follow'}
                                            </button>
                                        )}
                                        {post.authorId === user.id && (
                                            <button onClick={() => deletePost(post.id)} className="text-gray-400 hover:text-red-500">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="p-4">
                                     <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-light mb-4 text-sm whitespace-pre-wrap">
                                        {post.content}
                                    </p>
                                    {post.imageUrl && (
                                        <div className="w-full rounded-lg overflow-hidden border border-gray-200 mb-2">
                                            <img src={post.imageUrl} alt="Post" className="w-full h-auto object-cover" />
                                        </div>
                                    )}
                                    {post.videoUrl && (
                                        <div className="w-full rounded-lg overflow-hidden border border-gray-200 mb-2 bg-black">
                                            <video src={post.videoUrl} controls className="w-full h-auto" />
                                        </div>
                                    )}
                                </div>

                                <div className="bg-ols-primary/5 p-3 flex items-center justify-between text-ols-primary">
                                    <div className="flex gap-6">
                                        <button className="flex items-center gap-1 hover:text-ols-secondary transition-colors">
                                            <Heart size={20} className={post.likedByUser ? "fill-red-600 text-red-600" : ""} />
                                            <span className="text-xs font-bold">{post.likes}</span>
                                        </button>
                                        <button className="flex items-center gap-1 hover:text-ols-secondary transition-colors">
                                            <MessageCircle size={20} />
                                            <span className="text-xs font-bold">{post.comments}</span>
                                        </button>
                                    </div>
                                    <button className="hover:text-ols-secondary transition-colors">
                                        <Share2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* SEARCH TAB */}
            {activeTab === 'Search' && (
                <div className="p-4">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ols-primary" size={18} />
                        <input 
                            type="text" 
                            placeholder="Find faithful friends..." 
                            className="w-full pl-10 pr-4 py-3 bg-white border border-ols-accent/30 rounded-lg focus:outline-none focus:border-ols-primary text-ols-primary placeholder-ols-muted"
                        />
                    </div>
                    <div className="text-center text-ols-muted text-sm mt-10">
                        Search features coming soon...
                    </div>
                </div>
            )}

            {/* CREATE TAB */}
            {activeTab === 'Create' && (
                <div className="p-4 h-full bg-white dark:bg-ols-surface flex flex-col">
                    <h3 className="font-serif font-bold text-xl text-ols-primary mb-6">New Reflection</h3>
                    <textarea 
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Share your spiritual journey..." 
                        className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-ols-primary focus:ring-1 focus:ring-ols-primary resize-none mb-4 h-40 bg-gray-50 dark:bg-ols-bg dark:text-white"
                    />
                    
                    {/* Media Previews */}
                    {(attachedImage || attachedVideo) && (
                        <div className="mb-4 relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300">
                             {attachedImage ? (
                                 <img src={attachedImage} className="w-full h-full object-cover" />
                             ) : (
                                 <video src={attachedVideo!} className="w-full h-full object-cover" />
                             )}
                             <button onClick={() => { setAttachedImage(null); setAttachedVideo(null); }} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1">
                                 <X size={12} />
                             </button>
                        </div>
                    )}

                    <div className="flex gap-4 mb-6">
                        <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 cursor-pointer hover:bg-gray-50">
                            <ImageIcon size={20} />
                            <span className="text-sm font-bold">Photo</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                        </label>
                        <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 cursor-pointer hover:bg-gray-50">
                            <Video size={20} />
                            <span className="text-sm font-bold">Video</span>
                            <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} />
                        </label>
                    </div>
                    
                    <button 
                        onClick={handleCreatePost}
                        disabled={!newPostContent && !attachedImage && !attachedVideo}
                        className="w-full bg-ols-primary text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#2d1b18] transition-colors disabled:opacity-50"
                    >
                        Post Reflection
                    </button>
                    <button 
                        onClick={() => setActiveTab('Feed')}
                        className="w-full text-gray-500 py-3 mt-4"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'Profile' && (
                <div className="bg-ols-bg min-h-screen">
                    <div className="bg-white dark:bg-ols-surface pb-6 rounded-b-3xl shadow-sm border-b border-ols-accent/20">
                        <div className="h-32 bg-ols-primary relative">
                             <button 
                                onClick={() => isEditingProfile ? saveProfile() : setIsEditingProfile(true)}
                                className="absolute top-4 right-4 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 backdrop-blur"
                             >
                                 {isEditingProfile ? <Check size={20}/> : <Edit3 size={20}/>}
                             </button>
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-white p-1 shadow-lg group cursor-pointer">
                                 <div className="w-full h-full rounded-full bg-ols-secondary flex items-center justify-center text-3xl font-serif font-bold text-white overflow-hidden relative">
                                     {user.avatarUrl ? (
                                         <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                     ) : (
                                         user.name.charAt(0)
                                     )}
                                     {isEditingProfile && (
                                         <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                             <Camera size={24} className="text-white"/>
                                         </div>
                                     )}
                                 </div>
                            </div>
                        </div>
                        <div className="mt-12 text-center px-4">
                            {isEditingProfile ? (
                                <div className="space-y-2 max-w-xs mx-auto">
                                    <input 
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full text-center border-b border-gray-300 dark:border-gray-700 focus:border-ols-primary outline-none font-serif font-bold text-xl bg-transparent dark:text-white"
                                        placeholder="Display Name"
                                    />
                                    <input 
                                        value={editBio}
                                        onChange={(e) => setEditBio(e.target.value)}
                                        className="w-full text-center border-b border-gray-300 dark:border-gray-700 focus:border-ols-primary outline-none text-sm bg-transparent dark:text-white"
                                        placeholder="Short Bio"
                                    />
                                </div>
                            ) : (
                                <>
                                    <h1 className="font-serif font-bold text-xl text-ols-primary">{user.name}</h1>
                                    <p className="text-sm text-ols-muted">@{user.username}</p>
                                    <p className="text-sm text-gray-600 mt-2 max-w-xs mx-auto italic">"{user.bio}"</p>
                                </>
                            )}
                        </div>
                        <div className="flex justify-center gap-8 mt-6">
                             <div className="text-center">
                                 <div className="font-bold text-ols-primary text-lg">{userPosts.length}</div>
                                 <div className="text-xs text-ols-muted uppercase tracking-wider">Posts</div>
                             </div>
                             <div className="text-center">
                                 <div className="font-bold text-ols-primary text-lg">{user.followers}</div>
                                 <div className="text-xs text-ols-muted uppercase tracking-wider">Followers</div>
                             </div>
                             <div className="text-center">
                                 <div className="font-bold text-ols-primary text-lg">{user.following}</div>
                                 <div className="text-xs text-ols-muted uppercase tracking-wider">Following</div>
                             </div>
                        </div>
                    </div>
                    
                    <div className="p-4">
                        <h3 className="font-serif font-bold text-ols-primary mb-3 pl-2 border-l-4 border-ols-secondary">My Reflections</h3>
                         <div className="space-y-4">
                             {userPosts.length > 0 ? userPosts.map(p => (
                                 <div key={p.id} className="bg-white dark:bg-ols-surface p-4 rounded-lg shadow-sm border-l-2 border-ols-primary">
                                     <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">{p.content}</p>
                                     {p.imageUrl && <div className="h-20 w-20 mt-2 rounded bg-gray-100 overflow-hidden"><img src={p.imageUrl} className="w-full h-full object-cover"/></div>}
                                     <div className="mt-2 text-xs text-ols-muted flex justify-between">
                                         <span>{p.timeAgo}</span>
                                         <div className="flex gap-2">
                                            <span>{p.likes} Likes</span>
                                            <button onClick={() => deletePost(p.id)} className="text-red-500 hover:underline">Delete</button>
                                         </div>
                                     </div>
                                 </div>
                             )) : (
                                 <div className="text-center py-10 text-gray-400 text-sm italic">Your journal is empty.</div>
                             )}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Bottom Nav */}
        <div className="sticky bottom-0 bg-white dark:bg-ols-surface border-t border-gray-200 dark:border-gray-800 flex justify-around p-3 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button onClick={() => setActiveTab('Feed')} className={`p-2 rounded-full ${activeTab === 'Feed' ? 'bg-ols-primary/10 text-ols-primary' : 'text-gray-400'}`}>
                <Home size={24} />
            </button>
            <button onClick={() => setActiveTab('Search')} className={`p-2 rounded-full ${activeTab === 'Search' ? 'bg-ols-primary/10 text-ols-primary' : 'text-gray-400'}`}>
                <Compass size={24} />
            </button>
             <button onClick={() => setActiveTab('Profile')} className={`p-2 rounded-full ${activeTab === 'Profile' ? 'bg-ols-primary/10 text-ols-primary' : 'text-gray-400'}`}>
                <UserIcon size={24} />
            </button>
        </div>
    </div>
  );

  return (
    <div className="relative animate-fade-in h-[calc(100vh-140px)] overflow-hidden rounded-2xl">
        {/* Locked Overlay */}
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/40 dark:bg-ols-bg/40 backdrop-blur-md">
            <div className="bg-white dark:bg-ols-surface p-8 rounded-3xl shadow-xl flex flex-col items-center text-center border border-gray-200 dark:border-gray-800 max-w-sm mx-4">
                <div className="w-16 h-16 bg-ols-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Lock className="text-ols-primary" size={32} />
                </div>
                <h2 className="font-serif text-2xl font-bold text-ols-primary">Currently On Work</h2>
            </div>
        </div>

        {/* Blurred Content */}
        <div className="pointer-events-none select-none blur-md opacity-40 h-full overflow-hidden">
            {renderContent()}
        </div>
    </div>
  );
};

export default Community;
