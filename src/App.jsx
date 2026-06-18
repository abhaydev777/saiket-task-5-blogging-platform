import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  ArrowRight, 
  X, 
  Sparkles, 
  Menu, 
  Check, 
  ArrowUpRight, 
  Calendar, 
  Clock, 
  Share2,
  BookOpen,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { blogsData } from './data/blogs';
import { supabase } from './supabase';
import logoSaiket from './assets/logo_saiket.png';

// StoryCraft Logo component
const StoryCraftLogo = () => (
  <div className="flex items-center gap-2 cursor-pointer group">
    <div className="relative w-8 h-8 flex items-center justify-center rounded-xl overflow-hidden shadow-sm transition-transform group-hover:scale-105">
      <img src={logoSaiket} alt="StoryCraft Logo" className="w-full h-full object-cover" />
    </div>
    <span className="font-extrabold text-2xl tracking-tight text-slate-900 font-heading">StoryCraft</span>
  </div>
);

// Custom inline SVG Icons for Socials
const TwitterIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Preset beautiful Unsplash images for quick selector in form
const PRESET_IMAGES = {
  Technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  Travel: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
  Lifestyle: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80',
  Business: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  Design: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80'
};

const CATEGORIES_LIST = ['Technology', 'Travel', 'Lifestyle', 'Business', 'Design'];

let isSeedingInProgress = false;

export default function App() {
  const [blogs, setBlogs] = useState(blogsData);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'blogs' | 'create-blog' | 'dashboard' | 'about' | 'contact'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState(null);
  
  // Navigation states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  
  // CRUD states
  const [editPost, setEditPost] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Technology');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState(PRESET_IMAGES.Technology);
  const [formReadTime, setFormReadTime] = useState('5 min read');
  const [formContent, setFormContent] = useState('');
  
  // Contact Form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch blogs from Supabase or fallback to mock data
  const fetchBlogs = async () => {
    if (!supabase) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        if (isSeedingInProgress) return;
        isSeedingInProgress = true;
        // Auto-seed database if empty
        const seedData = blogsData.map(blog => ({
          title: blog.title,
          category: blog.category,
          description: blog.description,
          content: blog.content,
          image: blog.image,
          read_time: blog.readTime,
          is_featured: blog.id === 'ai-software-development'
        }));

        const { data: inserted, error: insertError } = await supabase
          .from('blogs')
          .insert(seedData)
          .select();

        if (insertError) throw insertError;

        if (inserted) {
          const formatted = inserted.map(item => ({
            id: item.id,
            title: item.title,
            category: item.category,
            description: item.description,
            content: item.content,
            image: item.image,
            readTime: item.read_time,
            date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            isFeatured: item.is_featured
          }));
          setBlogs(formatted);
        }
      } else {
        const formatted = data.map(item => ({
          id: item.id,
          title: item.title,
          category: item.category,
          description: item.description,
          content: item.content,
          image: item.image,
          readTime: item.read_time,
          date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          isFeatured: item.is_featured
        }));
        setBlogs(formatted);
      }
    } catch (err) {
      console.error('Error fetching blogs from Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Scroll to top when activeArticle changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeArticle]);

  // Helper function to handle navigation changes cleanly
  const navigateTo = (view, category = null) => {
    setCurrentView(view);
    if (category !== null) {
      setSelectedCategory(category);
    }
    setActiveArticle(null); // Clear reader view on navigating
    setMobileMenuOpen(false);
    setCategoriesDropdownOpen(false);
    setSearchQuery('');
    setEditPost(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter blogs based on category and search query
  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => {
      const matchesCategory = selectedCategory ? blog.category === selectedCategory : true;
      const matchesSearch = searchQuery 
        ? blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          blog.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [blogs, selectedCategory, searchQuery]);

  // Featured blogs are the first 3 items in blogs array
  const featuredBlogs = useMemo(() => {
    return blogs.slice(0, 3);
  }, [blogs]);

  // Split filtered blogs into Hero (first) and Regular (rest)
  const heroPost = useMemo(() => {
    if (searchQuery) return null;
    return filteredBlogs[0] || null;
  }, [filteredBlogs, searchQuery]);

  const regularPosts = useMemo(() => {
    if (searchQuery) return filteredBlogs;
    return filteredBlogs.slice(1);
  }, [filteredBlogs, searchQuery]);

  const handleCategoryClick = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
      if (currentView !== 'home' && currentView !== 'blogs') {
        setCurrentView('blogs');
      }
      setTimeout(() => {
        const element = document.getElementById('recent-posts-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (currentView !== 'home' && currentView !== 'blogs') {
      setCurrentView('blogs');
    }
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  // CRUD Operations
  const handleOpenCreateForm = (postToEdit = null) => {
    if (postToEdit) {
      setEditPost(postToEdit);
      setFormTitle(postToEdit.title);
      setFormCategory(postToEdit.category);
      setFormDescription(postToEdit.description);
      setFormImage(postToEdit.image);
      setFormReadTime(postToEdit.readTime);
      setFormContent(postToEdit.content);
    } else {
      setEditPost(null);
      setFormTitle('');
      setFormCategory('Technology');
      setFormDescription('');
      setFormImage(PRESET_IMAGES.Technology);
      setFormReadTime('5 min read');
      setFormContent('');
    }
    navigateTo('create-blog');
  };

  const handleFormCategoryChange = (e) => {
    const cat = e.target.value;
    setFormCategory(cat);
    // Auto populate Unsplash image if it matches default presets
    if (PRESET_IMAGES[cat]) {
      setFormImage(PRESET_IMAGES[cat]);
    }
  };

  const handlePublishPost = async (e) => {
    e.preventDefault();
    if (!formTitle || !formDescription || !formContent) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      if (editPost) {
        // Edit mode
        if (supabase) {
          const { error } = await supabase
            .from('blogs')
            .update({
              title: formTitle,
              category: formCategory,
              description: formDescription,
              image: formImage,
              read_time: formReadTime,
              content: formContent
            })
            .eq('id', editPost.id);

          if (error) throw error;
        }

        setBlogs(prev => prev.map(p => p.id === editPost.id ? {
          ...p,
          title: formTitle,
          category: formCategory,
          description: formDescription,
          image: formImage,
          readTime: formReadTime,
          content: formContent
        } : p));
        setEditPost(null);
        alert('Post updated successfully!');
      } else {
        // Create mode
        const generatedId = supabase ? undefined : `post-${Date.now()}`;
        const newPostLocal = {
          title: formTitle,
          category: formCategory,
          description: formDescription,
          image: formImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
          read_time: formReadTime,
          content: formContent
        };

        if (supabase) {
          const { data, error } = await supabase
            .from('blogs')
            .insert([newPostLocal])
            .select();

          if (error) throw error;
          if (data && data[0]) {
            const item = data[0];
            const formatted = {
              id: item.id,
              title: item.title,
              category: item.category,
              description: item.description,
              content: item.content,
              image: item.image,
              readTime: item.read_time,
              date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
              isFeatured: item.is_featured
            };
            setBlogs(prev => [formatted, ...prev]);
          }
        } else {
          const formatted = {
            id: generatedId,
            ...newPostLocal,
            readTime: formReadTime,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            isFeatured: false
          };
          setBlogs(prev => [formatted, ...prev]);
        }
        alert('New post published successfully!');
      }
      navigateTo('blogs');
    } catch (err) {
      console.error('Error saving post:', err);
      alert('Error saving post: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    setIsLoading(true);
    try {
      if (supabase) {
        const { error } = await supabase
          .from('blogs')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }
      setBlogs(prev => prev.filter(p => p.id !== id));
      alert('Post deleted successfully!');
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Error deleting post: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Contact Form Submit handler
  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
      setContactSubmitted(false);
      alert('Thank you! Your message has been received.');
    }, 1500);
  };

  const renderMarkdown = (content) => {
    if (!content) return null;
    return content.split('\n').map((line, idx) => {
      if (line.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-6 mb-4 font-heading leading-tight">
            {line.substring(2)}
          </h1>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl md:text-2xl font-bold text-slate-800 mt-6 mb-3 font-heading">
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-6 list-disc text-slate-600 my-1 font-sans">
            {line.substring(2)}
          </li>
        );
      }
      if (line.startsWith('1. ')) {
        return (
          <li key={idx} className="ml-6 list-decimal text-slate-600 my-1 font-sans">
            {line.substring(3)}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-4" />;
      }
      return (
        <p key={idx} className="text-slate-600 leading-relaxed my-3 font-sans text-base md:text-lg">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/30 flex flex-col relative selection:bg-violet-100 selection:text-violet-800">
      
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div onClick={() => navigateTo('home')} className="flex items-center gap-6">
            <StoryCraftLogo />
            <span className="bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-md text-[10px] tracking-wider uppercase">
              BLOG
            </span>
          </div>

          {/* Desktop Navigation - Centered Hyperlinks */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 relative">
            <button 
              onClick={() => navigateTo('home')} 
              className={`hover:text-slate-900 transition-colors ${currentView === 'home' ? 'text-violet-600' : ''}`}
            >
              Home
            </button>
            {/* Blogs Dropdown Trigger */}
            <div className="relative">
              <button 
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className={`hover:text-slate-900 transition-colors flex items-center gap-1 ${currentView === 'blogs' ? 'text-violet-600' : ''}`}
              >
                Blogs <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoriesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {categoriesDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setCategoriesDropdownOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 mt-2 w-48 rounded-xl bg-white border border-slate-200/80 shadow-xl py-2 z-20 text-xs font-semibold"
                    >
                      <button
                        onClick={() => {
                          setSelectedCategory(null);
                          navigateTo('blogs');
                          setCategoriesDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${selectedCategory === null && currentView === 'blogs' ? 'text-violet-600 bg-violet-50/50' : 'text-slate-700'}`}
                      >
                        All Blogs
                        {selectedCategory === null && currentView === 'blogs' && <Check className="w-3 h-3 text-violet-600 stroke-[3px]" />}
                      </button>
                      <div className="border-t border-slate-100 my-1" />
                      {CATEGORIES_LIST.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            navigateTo('blogs');
                            setCategoriesDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${selectedCategory === cat ? 'text-violet-600 bg-violet-50/50' : 'text-slate-700'}`}
                        >
                          {cat}
                          {selectedCategory === cat && <Check className="w-3 h-3 text-violet-600 stroke-[3px]" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => navigateTo('dashboard')} 
              className={`hover:text-slate-900 transition-colors ${currentView === 'dashboard' ? 'text-violet-600' : ''}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => navigateTo('about')} 
              className={`hover:text-slate-900 transition-colors ${currentView === 'about' ? 'text-violet-600' : ''}`}
            >
              About
            </button>
            <button 
              onClick={() => navigateTo('contact')} 
              className={`hover:text-slate-900 transition-colors ${currentView === 'contact' ? 'text-violet-600' : ''}`}
            >
              Contact
            </button>
          </nav>

          {/* Right side - Create Post button */}
          <div className="hidden md:flex items-center">
            <button 
              onClick={() => handleOpenCreateForm()}
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-violet-100 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Create Post
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 hover:text-slate-900 focus:outline-none p-1"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-slate-100 bg-white overflow-hidden shadow-lg"
            >
              <div className="px-4 py-4 space-y-3 flex flex-col font-medium text-slate-700 text-sm">
                <button onClick={() => navigateTo('home')} className="text-left py-2 border-b border-slate-50">Home</button>
                <button onClick={() => navigateTo('blogs')} className="text-left py-2 border-b border-slate-50">Blogs</button>
                
                {/* Categories inline list on mobile */}
                <div className="space-y-1.5 pl-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Categories</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {CATEGORIES_LIST.map((cat) => (
                      <button 
                        key={cat} 
                        onClick={() => {
                          setSelectedCategory(cat);
                          navigateTo('blogs');
                        }}
                        className={`text-left py-1 hover:text-violet-600 ${selectedCategory === cat ? 'text-violet-600 font-bold' : ''}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={() => navigateTo('dashboard')} className="text-left py-2 border-b border-slate-50">Dashboard</button>
                <button onClick={() => navigateTo('about')} className="text-left py-2 border-b border-slate-50">About</button>
                <button onClick={() => navigateTo('contact')} className="text-left py-2 border-b border-slate-50">Contact</button>
                
                <button 
                  onClick={() => handleOpenCreateForm()} 
                  className="w-full bg-violet-600 text-white text-center py-2.5 rounded-xl font-bold mt-2"
                >
                  Create Post
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. Page Router rendering */}

      {activeArticle ? (
        /* DEDICATED FULL-PAGE ARTICLE READER */
        <div className="flex-grow max-w-4xl mx-auto w-full px-4 py-12 space-y-8">
          {/* Back button */}
          <button 
            onClick={() => {
              setActiveArticle(null);
              window.scrollTo({ top: 0 });
            }}
            className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Articles
          </button>

          {/* Hero info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold">
              <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-md uppercase">
                {activeArticle.category}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {activeArticle.date}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {activeArticle.readTime}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] font-heading">
              {activeArticle.title}
            </h1>
            <p className="text-slate-500 italic text-base md:text-lg leading-relaxed border-l-4 border-violet-400 pl-4 py-1">
              {activeArticle.description}
            </p>
          </div>

          {/* Banner Image */}
          <div className="h-64 sm:h-[400px] md:h-[480px] rounded-3xl overflow-hidden bg-slate-100 shadow-md border border-slate-100">
            <img 
              src={activeArticle.image} 
              alt={activeArticle.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Rich text container */}
          <article className="prose prose-slate max-w-none pb-12 border-b border-slate-200">
            {renderMarkdown(activeArticle.content)}
          </article>

          {/* Reader bottom utility bar */}
          <div className="flex items-center justify-between py-6">
            <span className="text-xs font-bold text-slate-400 uppercase">Written by StoryCraft Team</span>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 py-1.5 px-4 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow transition-all"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* VIEW A: HOME VIEW */}
      {currentView === 'home' && (
        <>
          {/* Hero Section */}
          <section className="hero-gradient pt-20 pb-16 px-4 border-b border-slate-200/50 relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,transparent)] pointer-events-none" />
            <div className="max-w-6xl mx-auto text-center relative z-10">
              <span className="text-[11px] uppercase tracking-widest font-extrabold text-red-500 mb-4 inline-block">
                BLOGS
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-[64px] font-extrabold text-slate-900 tracking-tight leading-[1.08] mb-12 font-heading max-w-4xl mx-auto">
                Blogs on product <br />
                management & user <br />
                feedback
              </h1>

              {/* READ BY CATEGORY Header */}
              <div className="text-left mt-16 border-t border-slate-200/70 pt-6">
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  READ BY CATEGORY
                </span>
              </div>

              {/* Category Selection Cards - 3 categories with exact reference aspect ratio */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-6xl mx-auto">
                {CATEGORIES_LIST.slice(0, 3).map((cat, idx) => {
                  const gradient = idx === 0 
                    ? 'from-indigo-600/80 to-purple-500/80' 
                    : idx === 1 
                      ? 'from-pink-600/80 to-rose-500/80' 
                      : 'from-amber-600/80 to-orange-500/80';
                  
                  return (
                    <div 
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      className={`relative h-[150px] md:h-[160px] rounded-[24px] overflow-hidden cursor-pointer group shadow-sm border border-slate-200/50 hover:shadow-lg transition-all duration-300 ${selectedCategory === cat ? 'ring-2 ring-violet-500 ring-offset-2 scale-102' : ''}`}
                    >
                      {/* Image underlay */}
                      <img 
                        src={PRESET_IMAGES[cat]} 
                        alt={cat} 
                        className="absolute inset-0 w-full h-full object-cover" 
                      />
                      {/* Gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-tr ${gradient} mix-blend-multiply transition-transform duration-500 group-hover:scale-110`} />
                      <div className="absolute inset-0 bg-black/5 hover:bg-black/0 transition-colors" />
                      <div className="absolute left-6 bottom-6 z-10">
                        <span className="bg-white text-slate-900 text-sm font-semibold px-5 py-2.5 rounded-full shadow-md border border-slate-100 flex items-center gap-1.5">
                          {cat}
                          {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-violet-600 stroke-[3px]" />}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </section>

          {/* Featured Blogs Row */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 shrink-0">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 block mb-6">
              FEATURED BLOGS
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-slate-200 pb-12">
              {featuredBlogs.map((blog) => (
                <div 
                  key={blog.id} 
                  onClick={() => setActiveArticle(blog)}
                  className="cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      <span>{blog.category}</span>
                      <span className="text-slate-300">—</span>
                      <span>{blog.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-3 leading-snug group-hover:underline decoration-violet-500 decoration-2 underline-offset-4 transition-all">
                      {blog.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-violet-600 mt-4 group-hover:translate-x-1 transition-transform">
                    Read Article <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent/Latest Posts Grid */}
          {recentPostsGrid()}
        </>
      )}

      {/* VIEW B: ALL BLOGS VIEW */}
      {currentView === 'blogs' && (
        <div className="flex-grow py-8">
          {recentPostsGrid()}
        </div>
      )}

      {/* VIEW C: CREATE / EDIT BLOG VIEW */}
      {currentView === 'create-blog' && (
        <div className="flex-grow max-w-4xl mx-auto w-full px-4 py-12">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 md:p-10 space-y-8">
            <div className="border-b border-slate-100 pb-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-500 bg-violet-100 px-3 py-1 rounded-md">
                {editPost ? 'ADMIN EDITOR' : 'CONTRIBUTOR FORM'}
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading mt-3">
                {editPost ? `Edit Post: "${editPost.title}"` : 'Create a New Blog Post'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Fill out the metadata, pick or paste an image link, and write the body content in Markdown format.
              </p>
            </div>

            <form onSubmit={handlePublishPost} className="space-y-6 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold uppercase text-slate-500">Post Title *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 10 Minimalist UI Hacks"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all font-semibold text-slate-800"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold uppercase text-slate-500">Category *</label>
                  <select 
                    value={formCategory}
                    onChange={handleFormCategoryChange}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all font-semibold text-slate-800"
                  >
                    {CATEGORIES_LIST.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image URL with Preset Picker info */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold uppercase text-slate-500">Banner Image URL</label>
                  <input 
                    type="url" 
                    placeholder="https://images.unsplash.com/..."
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all font-mono text-xs text-slate-600"
                  />
                  <span className="text-[10px] text-slate-400 block font-medium">
                    ⚡ Auto-populates a matching high-quality Unsplash image when you change categories.
                  </span>
                </div>

                {/* Read Time */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold uppercase text-slate-500">Estimated Read Time</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 5 min read"
                    value={formReadTime}
                    onChange={(e) => setFormReadTime(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase text-slate-500">Short Summary / Description *</label>
                <textarea 
                  required
                  rows={2}
                  maxLength={200}
                  placeholder="Provide a quick overview of what readers will learn in this post..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-4 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Body Content in Markdown */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-extrabold uppercase text-slate-500">Markdown Body Content *</label>
                  <span className="text-[10px] text-slate-400 font-semibold">Supports headers (# and ##) and lists (* and 1.)</span>
                </div>
                <textarea 
                  required
                  rows={10}
                  placeholder="# Hello World&#10;&#10;Write details about your post here. Use markdown structures easily."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-4 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all font-mono text-xs text-slate-700 placeholder:text-slate-400"
                />
              </div>

              {/* Image Preview Card */}
              {formImage && (
                <div className="border border-slate-100 rounded-2xl overflow-hidden p-2 bg-slate-50/50">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block mb-2 px-1">Banner Image Preview</span>
                  <div className="h-44 rounded-xl overflow-hidden shadow-inner">
                    <img 
                      src={formImage} 
                      alt="Form Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Actions row */}
              <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                <button 
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-violet-100 hover:shadow-violet-200"
                >
                  {editPost ? 'Save Changes' : 'Publish Blog'}
                </button>
                <button 
                  type="button"
                  onClick={() => navigateTo(editPost ? 'dashboard' : 'home')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs px-6 py-3 rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* VIEW D: DASHBOARD VIEW */}
      {currentView === 'dashboard' && (
        <div className="flex-grow max-w-7xl mx-auto w-full px-4 py-12">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 md:p-10 space-y-6">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-500 bg-violet-100 px-3 py-1 rounded-md">
                  ADMIN CONSOLE
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading mt-3">
                  Manage Blog Posts
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Create, update, or remove articles from the platform list.
                </p>
              </div>
              <button 
                onClick={() => handleOpenCreateForm()}
                className="bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-violet-100 flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" /> Create New Post
              </button>
            </div>

            {/* Posts Table list */}
            {blogs.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <span className="text-slate-400 block text-3xl font-heading">✦ No articles found ✦</span>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Get started by publishing your very first article using the creator dashboard button above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider">
                      <th className="p-4 w-12">#</th>
                      <th className="p-4">Post Info</th>
                      <th className="p-4 w-28">Category</th>
                      <th className="p-4 w-28">Read Time</th>
                      <th className="p-4 w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {blogs.map((blog, idx) => (
                      <tr key={blog.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                              <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-0.5">
                              <span 
                                onClick={() => setActiveArticle(blog)}
                                className="font-extrabold text-sm text-slate-900 hover:underline cursor-pointer leading-tight block"
                              >
                                {blog.title}
                              </span>
                              <span className="text-[10px] text-slate-400 block">{blog.date}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold">
                            {blog.category}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 font-semibold">{blog.readTime}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleOpenCreateForm(blog)}
                              className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-violet-50 text-slate-500 hover:text-violet-600 transition-colors flex items-center justify-center border border-slate-200/50"
                              title="Edit Post"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeletePost(blog.id)}
                              className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors flex items-center justify-center border border-slate-200/50"
                              title="Delete Post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      )}

      {/* VIEW E: ABOUT VIEW */}
      {currentView === 'about' && (
        <div className="flex-grow max-w-5xl mx-auto w-full px-4 py-16 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[11px] uppercase tracking-widest font-extrabold text-violet-500 bg-violet-100 px-3 py-1 rounded-md inline-block">
              OUR MISSION
            </span>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.1] font-heading">
              Sharing thoughts, guides, and lessons learned about building beautiful web experiences.
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              StoryCraft Blog is dedicated to empowering developers, founders, and designers with actionable content spanning modern front-end engineering, beautiful user interfaces, and business strategies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">Premium Engineering</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We write depth tutorials explaining clean react state layouts, responsive CSS container queries, and robust API patterns.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">Rich Storytelling</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Whether solo traveling in SE Asia or scaling a SaaS business, we tell authentic stories backed by metrics and details.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">Global Community</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We build tool systems and release notes templates used by thousands of creative individuals worldwide.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW F: CONTACT VIEW */}
      {currentView === 'contact' && (
        <div className="flex-grow max-w-4xl mx-auto w-full px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
            
            {/* Sidebar detail */}
            <div className="md:col-span-2 bg-slate-900 text-white p-8 md:p-10 flex flex-col justify-between space-y-8 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/20 blur-3xl rounded-full" />
              <div className="space-y-4 relative z-10">
                <h3 className="text-2xl font-extrabold tracking-tight font-heading">Get in Touch</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Have a suggestion, feedback, or custom article submission request? Drop us a line.
                </p>
              </div>

              <div className="space-y-4 relative z-10 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-3">
                  <span>📍</span>
                  <span>San Francisco, California</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>✉️</span>
                  <span>hello@supahub.com</span>
                </div>
              </div>
              
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">
                ✦ SUPAHUB DEV BLOG
              </div>
            </div>

            {/* Form client */}
            <form onSubmit={handleContactSubmit} className="md:col-span-3 p-8 md:p-10 space-y-5 text-sm">
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase text-slate-500">Your Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="John Doe"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase text-slate-500">Email Address *</label>
                <input 
                  type="email" 
                  required
                  placeholder="john@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase text-slate-500">Subject *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Feedback Board Customization"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase text-slate-500">Message Content *</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Write your suggestions or questions here..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-4 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <button 
                type="submit"
                disabled={contactSubmitted}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md shadow-violet-100 flex items-center justify-center gap-1"
              >
                {contactSubmitted ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  )}


      {/* 3. Footer Section */}
      <footer className="bg-white border-t border-slate-200/80 py-16 px-4 shrink-0 mt-auto">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Top segment: Description only */}
          <div className="pb-12 border-b border-slate-100">
            <div className="max-w-md">
              <div className="flex items-center gap-2 text-violet-600 font-extrabold text-xl">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-sm">
                  <img src={logoSaiket} alt="StoryCraft Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-slate-900 font-heading">StoryCraft</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mt-3">
                StoryCraft Blog shares thoughts, guides, and lessons learned about Technology, Travel, Lifestyle, Business, and Design.
              </p>
            </div>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs font-semibold">
            
            {/* Column 1: CATEGORIES */}
            <div className="space-y-4">
              <h4 className="text-slate-400 uppercase tracking-widest text-[10px] font-extrabold">CATEGORIES</h4>
              <ul className="space-y-2.5 text-slate-500">
                {CATEGORIES_LIST.map((cat) => (
                  <li key={cat}>
                    <button 
                      onClick={() => handleCategoryClick(cat)}
                      className="hover:text-slate-900 transition-colors text-left"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: RESOURCES */}
            <div className="space-y-4">
              <h4 className="text-slate-400 uppercase tracking-widest text-[10px] font-extrabold">RESOURCES</h4>
              <ul className="space-y-2.5 text-slate-500">
                <li><button onClick={() => navigateTo('blogs')} className="hover:text-slate-900 transition-colors text-left">All Blogs</button></li>
                <li><button onClick={() => navigateTo('about')} className="hover:text-slate-900 transition-colors text-left">Glossary</button></li>
              </ul>
            </div>

            {/* Column 3: COMPANY */}
            <div className="space-y-4">
              <h4 className="text-slate-400 uppercase tracking-widest text-[10px] font-extrabold">COMPANY</h4>
              <ul className="space-y-2.5 text-slate-500">
                <li><button onClick={() => navigateTo('about')} className="hover:text-slate-900 transition-colors text-left">About Us</button></li>
                <li><button onClick={() => navigateTo('contact')} className="hover:text-slate-900 transition-colors text-left">Contact Us</button></li>
              </ul>
            </div>

            {/* Column 4: LEGAL */}
            <div className="space-y-4">
              <h4 className="text-slate-400 uppercase tracking-widest text-[10px] font-extrabold">LEGAL</h4>
              <ul className="space-y-2.5 text-slate-500">
                <li><a href="#privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-slate-900 transition-colors">Terms of Service</a></li>
              </ul>
            </div>

          </div>

          {/* Bottom row: copyright & social icons */}
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span>✦ Copyright © 2025 Bruvvv LLC. All rights reserved. Designed by Bruvvv</span>
            </div>
            <div className="flex gap-4 items-center">
              <a href="https://twitter.com/supahub" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-violet-600 transition-colors">
                <TwitterIcon />
              </a>
              <a href="https://instagram.com/supahub_hq" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-violet-600 transition-colors">
                <InstagramIcon />
              </a>
              <a href="https://linkedin.com/company/supahub" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-violet-600 transition-colors">
                <LinkedinIcon />
              </a>
            </div>
          </div>

        </div>
      </footer>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center pointer-events-auto">
          <div className="bg-white/90 px-6 py-5 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-200/50">
            <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">Connecting to Database...</span>
          </div>
        </div>
      )}

    </div>
  );

  // Modular helper to render the recent posts list
  function recentPostsGrid() {
    return (
      <section id="recent-posts-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-20 flex-grow">
        
        {/* Title and Search Control */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
              {selectedCategory ? `${selectedCategory} Articles` : 'LATEST POSTS'}
            </h2>
            {selectedCategory && (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-violet-600 hover:text-violet-800 font-semibold mt-1 flex items-center gap-1 underline"
              >
                Show all articles
              </button>
            )}
          </div>
          
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-white border border-slate-200/80 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-400 text-slate-800"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Hero Post Card (only shown at home view and when not filtering/searching) */}
        {currentView === 'home' && heroPost && (
          <div 
            onClick={() => setActiveArticle(heroPost)}
            className="cursor-pointer bg-white border border-slate-200/60 hover:border-slate-300 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 mb-12 shadow-sm hover:shadow-xl transition-all duration-300 group"
          >
            <div className="w-full md:w-1/2 h-64 md:h-80 rounded-2xl overflow-hidden bg-slate-100 relative shadow-inner">
              <img 
                src={heroPost.image} 
                alt={heroPost.title} 
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              />
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-between py-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-bold text-[10px]">
                    {heroPost.category}
                  </span>
                  <span>•</span>
                  <span>{heroPost.date}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-heading leading-tight group-hover:text-violet-600 transition-colors">
                  {heroPost.title}
                </h3>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                  {heroPost.description}
                </p>
              </div>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {heroPost.readTime}
                </span>
                <span className="text-xs font-bold text-violet-600 group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                  Read Article <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Regular Posts Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl">
            <span className="text-slate-400 text-sm font-semibold">No articles match your search or filter criteria.</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {regularPosts.slice(0, visibleCount).map((blog) => (
                <div 
                  key={blog.id} 
                  onClick={() => setActiveArticle(blog)}
                  className="cursor-pointer bg-white border border-slate-200/50 hover:border-slate-300 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Card image header */}
                    <div className="h-48 overflow-hidden bg-slate-100 relative border-b border-slate-100">
                      <img 
                        src={blog.image} 
                        alt={blog.title} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                    </div>
                    {/* Metadata & Title */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                          {blog.category}
                        </span>
                        <span>•</span>
                        <span>{blog.date}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-violet-600 transition-colors leading-snug">
                        {blog.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {blog.description}
                      </p>
                    </div>
                  </div>
                  {/* Footer links */}
                  <div className="px-6 pb-6 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    <span>{blog.readTime}</span>
                    <span className="text-violet-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read Article <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {regularPosts.length > visibleCount && (
              <div className="flex justify-center mt-12">
                <button 
                  onClick={handleLoadMore}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 font-bold text-xs px-6 py-3 rounded-full shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                >
                  Load More Articles
                </button>
              </div>
            )}
          </>
        )}

      </section>
    );
  }
}
