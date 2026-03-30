import React,{ useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import './Home.css';

const Home = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    parentName: '',
    email: '',
    phone: '',
    parentPhone: '',
    dob: '',
    program: '',
    qualification: '',
    statement: '',
    referral: '',
    termsAgree: false
  });
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const galleryRef = useRef(null);

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Home', to: '/', active: true },
    { label: 'Programs', to: '/programs', active: false },
    { label: 'Campus', to: '/campus', active: false },
    { label: 'Admissions', to: '/admissions', active: false },
  ];

  const stats = [
    { value: '98', suffix: '%', label: 'Graduate Placement', description: 'Securing positions within Fortune 500 companies and elite research labs within 6 months.' },
    { value: 'Top 1', suffix: '%', label: 'Research Output', description: 'Globally recognized contributions to Artificial Intelligence, Bio-Engineering, and FinTech.' },
    { value: '50', suffix: '+', label: 'Global Partnerships', description: 'Collaborative academic ventures with Ivy League and leading technological institutes.' },
  ];

  const galleryItems = [
    { title: 'High-tech Labs', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSYA_9sHZey0gDZ1pwIzP8CCrWurKkz5uA0M2KqB-R_eCdFmG4oWa6iszC9loatt0I3V67RnQWxTeOS_MzQYx15Td9Wh2-AOiTgT9zQksPV0penjQoLUitNE7S15euPJzj-F-JdeyX1K0ojK8VSk1XyFuBKltMJGLoYfwh9wgpzw-cb7KxvGYSHpujNlTlcaYTrMAa-MpWDEvYpCFjFrw7cqya5VnQf8g1GOtTiGrUI9uofP1rYQ3-sBk_IV5r3j-O8VNLnO_2cuUn' },
    { title: 'Rooftop Libraries', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACSzuFHnTguXDCIp70SzHgIEFHEo1UzytA8X6bbRrKH5Ey7KyAFZkddiVQ48P4_4gMwWG6f7mQfB1sTxqmZn_4zl7C89qBwb8Bw5uV7l5N4PSlr1zw1f8AsTrXPzlfjeygK3dMVcQdHhBISfQDZSgojl_naILx_haB2fGNjFi1jBkS5-f5PHOhGvbeCKPkGZZd5TuT0-TmaikvpIn-9XPtqgxGXZ9RQSoDke-sYOQZ0tp4OyocCEAoZRu-4YnjpwxeT0exBwfxZsCX' },
    { title: 'Creative Studios', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4lVNQyIe80GjGtne6uU1dAU3pDsFasFSJiprZaSR4YFkMXlISVPk0qw8GzF3t8lI3Bjmn88_lBzbNFOy88Im6LTJPH5t2x9oeCn30irG9jOoANp8odToZv3lY8IPlNcIHreUZtR9-jTMeLUz1_9_KKEYHu7FYRJrbhDQzKRAHt_s8QndbO16Bj73KkXjf1SHWY1D5WtwX5VwTO5k-xVqInbnVcPb_NOeZaF2f3iHxDCuxIxp6Mp1kKN2mGLqczO8Tl01V-cvHCtT1' },
    { title: 'Collaboration Zones', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHGAPYDx_2R8yALjbiA-GexxRVhGp0MY_oavvUaqA5HAnqz8ux7HsbBG9fJ6NpEyMVwjMuKdh71qnmhB3uiaANV-fhKNoKKBY6MMr-mEhzD57Yqq7RUAHgFGeSPerdKHnoqe7ajizxbVIveho9BsygsODuNGrzrj3F8tznERDw5C4PBeoahBp51Emkvd5cKiX8Vf63Pf7rMWQG2dtYnjGZGM7DoaAEuy_xCfoBl8P-Slj7iGjsjfkbJMvmECQzGEun8Q3QMqVDOihX' },
  ];

  const allEvents = [
    { category: 'wellness', title: 'Cognitive Breathwork', date: 18, month: 'Sept', time: '08:00 AM', description: 'Optimizing focus through respiratory control.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWxiWiWcDfbo1VX0QFdtznruR1wjI8zX389M64Gz9oNTOKgNq9PApnZvqUBy-04air8kRm93jRyuMfXjlUoUVzFqwqJXW0TnKJfzrs3wROqT_wQS3wcNuULWytVdW1q6t0jCZu6eFDJ1J2CHx_EJ9NmkLxprqJUTthuQTKrl6LD9sP5QrlsXnXsq5_KkPEGqYr1IFcTg24UdVxLBIKZTiIGMnbIbGxZv_5qELYRnPhy3JQlJO04-YSHMG2kEWTOGzLCVBfNvVVWgNz' },
    { category: 'social', title: 'Equinox Gala', date: 22, month: 'Sept', time: '07:30 PM', description: 'Networking under the synthetic stars.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjsRBrkr6c3VXsECrA3l8n2ajYv4nRc3en0cvBcDqgAIzHzKy7uB8f4IKQyOhYRr3J7L5csf8dNkODyKPgZeSZzJygK4q-p_JCega0dLNCAskr2aFRmXxUEcR6PJKobdb4yP2qwIXBZVzSYgt-AhF3ke1624mXsRXAm30j5adcbTGQVnhUJBZd7jjw9XvuUjSfmbV3ZrffbhhHGGkXn_OTAv8Q7Mfb0-DJXhZShu-KcoNPRp3pPYncHw5aWi9QknYCd-XuKnJUKKg3' },
    { category: 'academic', title: 'Neural Mesh Protocol', date: 30, month: 'Sept', time: '10:00 AM', description: 'Deep dive into subconscious interface.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_1VvHdfDc8gx5tNuNLoD21bi0DHMIAV3cB_ilbAVDmqEXAA7Rv1KsPrOJ5nlnvLR69MJwIShY0b0c4lBSkMzB9tMcC1mfAiwOQgzAlGW9JlaH_QQhbbLoxv_JoKz7icy3F-DGHIl0mVRGm7dCdjqt0gvMBoI-bd3iONas5INTESYOOgXscxzjprbMsJMOMkzvNZipIzWZI_W1ECMHUzmHRsqn-8zoGHfh28N1nwJATxgR4LbXhmQvTI6fiXSzzrUjKsQv2Jio0g1J' },
  ];

  const faculty = [
    { name: 'Dr. Alistair Thorne', role: 'Head of Innovation', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGXFdvGViuUD8JSiHxA3ySFxzm7jANqEY6fHE-7oWWHJedTD3PpbyCgcgNZHP-bBdttYkKDjBuKyq3sZz8gJdAL7Vs9hntNBvUi6UUL7LEExduQtTOJ3gLwI2BWk1x8GlYuqS06ZzrAQLAECY98zC8-_GfYCB0NQ6JvElSNvz5oAGZnEZcEaiDDpbxwNgX-t00iPr4tuKGzMm89bSgK3qE4WN2IGVwZkEV5hu_jwVZYvavTyB4z6henA7mqXqQZuG55hJF4itepfSD' },
    { name: 'Sarah J. Sterling', role: 'Creative Director', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAukSix1pPO6cMr3EUvJGntAltf1GZNy2weYVF0UVVTVHIOwkMtKxe1v_ktCaQIWRPnumaisLDkGhRAk0tyhvYfRUT7cfW-3HK-JcoKa7NxO3aL7wqV9Uz7UauHZNEdqxRfi-c-HiW_EVCG0gypET6H44inx-8Hv5egpWcby0r5_GYCYCVQ4gcmLRgPF1cMTs6TBeTdRT8M1PkXNhuNQmsYXv6hxrDX8V7NSwFRSTDYIQvBtLERSarN5jntJxYpJPARY6pmFgAqFR13' },
    { name: 'Prof. Marcus Vane', role: 'Ethics & Tech Lead', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7yCSCjeTETsQVNDZtEx00pp86ZhpSq52o6CDgWYpE2kPAJDWj9fa0HkIGcI9yDYVfKNLf_CL79Ww2DLp6cAfUG4ueA4TXfm6AwIDtui_C0uoVmrcnuVLVH7irWwsfcqddgBbtOtPT2rcKyUBXdUO0XJ2eYkdN4lnnV2hehWtJEyouDoWDZ_XG_Pg9SCouu9-NijcMCuI0Vd67TglM-6BUW1E5SxguLpnxBLZjJvBP5tYpqZTVnDjsL9MS8tATbgLcSQIynhgiZ7dC' },
    { name: 'Dr. Elena Rossi', role: 'Quantum Physics', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgowwrKP3HqzG1TbEFHjvdIBXCrPzz03Nfc2Wr-KlfGOl9Z3Fpgq8GMc5tVmoARgMv7HtSD9yxFN3JEgk5wEzj0OsAeywEBL4pO5K29FyN_ALHKS9_kdRBW7SJwyU_r_oVMTxPHYBBgpKk6xvWQmyCcTYYZdAieBE8yOhIHVBa7CrLJ4Qh9jqYgmW64C69Lwz6-KaBmfRAzxHww8zDdz3Tfx5aaZq0Qxw9sM-KRpFkuvAZymncW1mzkh4Nik0Lw-ILplBGeRAvOr2v' },
  ];

  const filters = ['all', 'academic', 'social', 'wellness'];

  // Filter events based on active filter - React way
  const filteredEvents = activeFilter === 'all' 
    ? allEvents 
    : allEvents.filter(event => event.category === activeFilter);

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.home-page .navbar');
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && modalOpen) {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modalOpen]);

  const scrollGallery = (direction) => {
    if (galleryRef.current) {
      const scrollAmount = 400;
      galleryRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const openModal = () => {
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = '';
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    setTimeout(() => {
      showToast('✓ Application submitted successfully! Check your email for confirmation.', 'success');
      setFormData({
        fullName: '',
        parentName: '',
        email: '',
        phone: '',
        parentPhone: '',
        dob: '',
        program: '',
        qualification: '',
        statement: '',
        referral: '',
        termsAgree: false
      });
      setSubmitting(false);
      setTimeout(() => closeModal(), 1500);
    }, 800);
  };

  return (
    <div className="home-page">
      {/* TopNavBar */}
      <nav className={`navbar ${isMenuOpen ? 'mobile-active' : ''}`}>
        <div className="navbar-brand">
          <Link to="/" className="logo-text">THE ACADEMY</Link>
          <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
          </button>
          
          <div className="navbar-links">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                className={link.active ? 'nav-link active' : 'nav-link'}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="nav-actions">
          <div className="nav-auth-links">
            <Link className="nav-auth-link" to="/signin">
              Sign In
            </Link>
          </div>
          <Link className="primary-btn" to="/admissions">
            Apply Now
          </Link>
        </div>
      </nav>
      <main className="main-content">
        {/* Immersive Hero */}
        <section className="hero-section">
          <div className="hero-bg">
            <img
              alt="Campus Architecture"
              className="hero-image"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQzjrgtnRd05hN4zW2f8_TcmY-yW1v5p0owBUOCcKDfouChAMHqBhusBJ8SzDnzftwIuj8U8HfhyeZqCO5QUEZ3vhgjVIKvsbl3k9ZlgulGSWVHkQWA2Z_I3RM8yQQDs38N_Yl2RWoQ8WRJTZRZK7b-aB86H7eNmavldwXQKDwQ_RyTN8nEgVUujdKf8adSsnSZ8VRRp029JjeSkdxpNe-0nuvbWeFvKux0RpZMNPSmKtk7tEkE3sw8ZQN9wRuzFzxfw1pVshSbjtx"
            />
            <div className="hero-gradient-overlay"></div>
          </div>
          <div className="hero-content">
            <span className="hero-badge">Enrollment Open</span>
            <h1 className="hero-title">
              The Future of <br />
              <span className="gradient-text">Academic Excellence</span>
            </h1>
            <p className="hero-description">
              Step into a sanctuary designed for the next generation of thinkers, creators, and innovators. Where tradition meets hyper-modernity.
            </p>
            <div className="hero-buttons">
              <Link className="primary-btn primary-btn-lg" to="/admissions">
                Apply for 2024
              </Link>
              <Link className="secondary-btn secondary-btn-lg" to="/signin">
                Go to Portal
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-value">
                {stat.value}<span className="stat-suffix">{stat.suffix}</span>
              </div>
              <p className="stat-label">{stat.label}</p>
              <p className="stat-description">{stat.description}</p>
            </div>
          ))}
        </div>


        
 
        {/* Mission & Vision Section */}
        <section className="mission-section">
          <div className="blur-circle blur-circle-top"></div>
          <div className="mission-container">
            <div className="mission-copy">
              <h2 className="section-title">Re-imagining the <br /><span className="text-secondary">Scholastic Sanctuary</span></h2>
              <p className="section-text">
                The Academy is more than an institution; it's a meticulously designed ecosystem for intellectual and creative expansion. We blend centuries of pedagogical wisdom with cutting-edge environmental psychology and cognitive science.
              </p>
              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-icon"><span className="material-symbols-outlined">science</span></div>
                  <div>
                    <h4 className="feature-title">Hyper-Labs</h4>
                    <p className="feature-description">Quantum-ready facilities for breakthrough research.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon"><span className="material-symbols-outlined">palette</span></div>
                  <div>
                    <h4 className="feature-title">Meta-Studios</h4>
                    <p className="feature-description">Where digital and physical art forms converge.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mission-visual">
              <div className="visual-frame glass-card">
                <img
                  alt="Students in Lab"
                  className="visual-image"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtg9Fsc-fF3vE7z61T98GvN6M8qj-0zT1f8m58_fK3V0Wp_O8n7_1l_9L8o7_1l_9L8o7_1l_9L8o7_1l_9L8o7_1l_9L8o7_1l_9L8"
                />
              </div>
            </div>
          </div>
        </section>

        {/* BENTO GRID OF CORE PILLARS */}
        <section className="pillars-section">
          <div className="pillars-grid">
            <div className="bento-card bento-card-large glass-card">
              <span className="material-symbols-outlined text-primary text-4xl">diversity_3</span>
              <h3 className="bento-card-title">Global Ethos</h3>
              <p className="bento-card-text">Our student body represents 45 nations, creating a rich tapestry of perspectives and cultural intelligence.</p>
            </div>
            <div className="bento-card bento-card-medium">
              <span className="material-symbols-outlined text-secondary text-3xl">psychology</span>
              <div>
                <h3 className="bento-card-title">AI-Driven Curriculum</h3>
                <p className="bento-card-text">Personalized learning paths powered by state-of-the-art neural engines.</p>
              </div>
            </div>
            <div className="bento-card bento-card-wide glass-card">
              <div className="bento-card-image-wrapper">
                <img
                  alt="Technology Lab"
                  className="bento-card-image"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwE7rqJKqQBK31VMlWu4EixeDfxp4pClYVTi52xxr-n0sPPZfV2xoi09t1cFahzHPcdoDl9gC3xMI0-PmDv8jHeTkGs2uKZEBTDMQ1CR3pJ2o-w-9DrpztZ1h0Q_NNISMhDsGLMt1GzY7s2D4yGFD4zFQlrULXgzFP7_i3U6jE59IetJEM1uHxmJSo3pCIjBxCrYJ18A0OK2cdtUTYeM5BPKQX0goC3qsuCy2fv29uxisw4oDr6PS54_2Yiw7ZxKdZhuh5XOo07QXw"
                />
              </div>
              <div className="bento-card-text-wrapper">
                <h3 className="bento-card-title">Robotics & Synergy</h3>
                <p className="bento-card-text">Exploring the frontier of human-machine interaction in our dedicated robotics wing.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Legacy & Future */}
        <section className="legacy-section">
          <div className="legacy-container">
            <div className="legacy-image-wrapper">
              <div className="legacy-blur"></div>
              <div className="legacy-image-frame glass-card">
                <img
                  alt="Legacy Image"
                  className="legacy-image grayscale-hover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKsQZVc_WWJDMdmasyABl0BQwJOsBGsLwNUU_V0rLFRB1R2KZlvyWgBJ0DPcpEAV9KLQ0xdwiN2S6zBgMXQM-2LDtGwUlz8bOcop_zQKrRRIcmHutk16HAQVJsjgZdcihjFlunk33e_uXyPYKEjpacb15prUgFUrmKQ6o68YHzFKookDDkfMIZzxLVmw84Vvx6GlgEYe8rVJ6rPQBL85vK3cU2zDTLx8zPmIb2rQHiF0mWrskdLzJrslHXapkCjE3F41RCS6ydljt7"
                />
              </div>
              <div className="year-badge glass-card">
                <div className="year-badge-value">1924</div>
                <div className="year-badge-label">The Foundation</div>
              </div>
            </div>
            <div className="legacy-content">
              <h2 className="section-title">The Evolution of Excellence</h2>
              <p className="section-text">
                What began a century ago as a quiet sanctuary for classical scholars has been fundamentally re-engineered for the digital frontier. We have preserved the sanctity of deep thought while integrating the boundless potential of the metaverse and neural-link research.
              </p>
              <p className="section-text">
                Today, The Academy stands as a "Neon Sanctuary"—a place where silence is respected, but innovation is constant. We don't just teach history; we provide the tools to write the next chapter of human civilization.
              </p>
              <div className="legacy-link-wrapper">
                <a className="text-link" href="#">
                  Read the Full Manifesto
                  <span className="material-symbols-outlined">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Campus Life Gallery */}
        <section className="gallery-section">
          <div className="gallery-header">
            <div>
              <h2 className="section-title-lg">Campus Life</h2>
              <p className="section-subtitle">A sanctuary for the soul and the mind.</p>
            </div>
            <div className="gallery-nav">
              <button className="nav-btn" onClick={() => scrollGallery('left')}>
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <button className="nav-btn" onClick={() => scrollGallery('right')}>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
          <div ref={galleryRef} className="gallery-scroll">
            {galleryItems.map((item, index) => (
              <div key={index} className="gallery-item">
                <img alt={item.title} className="gallery-item-image" src={item.image} />
                <div className="gallery-item-overlay"></div>
                <div className="gallery-item-content">
                  <h4 className="gallery-item-title">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Event Calendar */}
        <section className="events-section">
          <div className="events-container">
            <div className="events-header">
              <div>
                <h2 className="section-title-lg">Upcoming Calendar</h2>
                <p className="section-subtitle">Curated explorations for the inquisitive mind.</p>
              </div>
              <div className="filter-tabs">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    className={`filter-btn ${activeFilter === filter ? 'filter-btn-active' : ''}`}
                    onClick={() => handleFilterClick(filter)}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="events-grid">
              {filteredEvents.map((event, index) => (
                <div key={index} className="event-card-horizontal glass-card">
                  <div className="event-card-image">
                    <img alt={event.title} src={event.image} />
                    <div className="event-date-badge">
                      <span className="day">{event.date}</span>
                      <span className="month">{event.month}</span>
                    </div>
                  </div>
                  <div className="event-card-content">
                    <div className="event-card-top">
                      <span className={`category-tag tag-${event.category}`}>{event.category}</span>
                      <span className="event-time">{event.time}</span>
                    </div>
                    <h3 className="event-card-title">{event.title}</h3>
                    <p className="event-card-description">{event.description}</p>
                    <button className="text-link">Register Interest</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Faculty Spotlight */}
        <section className="faculty-section">
          <h2 className="section-title-lg text-center">Visionary Minds</h2>
          <div className="faculty-grid">
            {faculty.map((member, index) => (
              <div key={index} className="faculty-card glass-card">
                <div className="faculty-image-wrapper">
                  <img alt={member.name} className="faculty-image" src={member.image} />
                </div>
                <h4 className="faculty-name">{member.name}</h4>
                <p className="faculty-role">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="cta-section">
          <div className="cta-card glass-card">
            <div className="cta-content">
              <h2 className="cta-title">Begin Your Journey</h2>
              <p className="cta-text">Applications for the next academic cycle are now being reviewed. Secure your place in the future of education.</p>
              <div className="cta-buttons">
                <button className="primary-btn primary-btn-lg" onClick={openModal}>Book a Private Tour</button>
                <Link className="secondary-btn secondary-btn-lg" to="/admissions">View Admissions Process</Link>
              </div>
            </div>
          </div>
        </section>
        {/* Join the Future CTA */}
        <section className="cta-section">
          <div className="cta-bg">
            <img
              alt="Futuristic Tech"
              className="cta-bg-image"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbpJZIFMTlPxbDcY4BcL4x8OctejjcDM_1xv0sX16_DZEJjpRPy6e9SX5xm7JCn8aZAWHXNPS4b878iw-ll1aFV5CPlubVvmC24kfFZu4FEpaZkOp2FRh4bg43DYPBM0Jqen8U1iqNLAohWbT7KlDBVFt8PpbgiwmDVJUKaBeLrfRIoualL--K--cSQGhGe0VFbEIo0mWLBw--PPjDBuk5mM3epPHalCBADLI_Nhe4cIwRotmVObNvcMDHI1V-Nmx5JrDnWnn80xBD"
            />
            <div className="cta-overlay"></div>
          </div>
          <div className="cta-content">
            <h2 className="cta-title">
              READY TO ENTER THE <br />
              <span className="text-secondary">SANCTUARY?</span>
            </h2>
            <p className="cta-description">
              The next evolution of academic brilliance starts here. Secure your place in the most innovative community on the planet.
            </p>
            <Link className="primary-btn primary-btn-lg primary-btn-neon" to="/admissions">
              Apply for 2024 Intake
            </Link>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <span className="logo-text">THE ACADEMY</span>
            <p className="footer-copy">A Century of Excellence, Re-engineered.</p>
          </div>
          <div className="footer-links-grid">
            <div className="footer-column">
              <h4>Portal</h4>
              <Link to="/signin">Student Login</Link>
              <Link to="/signin">Parent Portal</Link>
              <Link to="/signin">Faculty Access</Link>
            </div>
            <div className="footer-column">
              <h4>Connect</h4>
              <a href="#">X / Twitter</a>
              <a href="#">Instagram</a>
              <a href="#">LinkedIn</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 The Academy. All Rights Reserved.</p>
        </div>
      </footer>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container glass-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="modal-header">
              <h3>Inquiry & Admission</h3>
              <p>Please provide your details for a personalized response.</p>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    name="fullName"
                    placeholder="Candidate's Name"
                    required
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Parent/Guardian Name</label>
                  <input
                    name="parentName"
                    placeholder="Full Name"
                    type="text"
                    value={formData.parentName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    name="email"
                    placeholder="email@example.com"
                    required
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Program of Interest</label>
                  <select
                    name="program"
                    required
                    value={formData.program}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a program</option>
                    <option value="innovation">Innovation & Tech</option>
                    <option value="humanities">Classical Humanities</option>
                    <option value="science">Applied Sciences</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Current Qualification</label>
                  <input
                    name="qualification"
                    placeholder="Year/Level"
                    type="text"
                    value={formData.qualification}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group full-width">
                <label>Personal Statement (Optional)</label>
                <textarea
                  name="statement"
                  placeholder="Tell us about your aspirations..."
                  rows="3"
                  value={formData.statement}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div className="form-checkbox">
                <input
                  id="termsAgree"
                  name="termsAgree"
                  required
                  type="checkbox"
                  checked={formData.termsAgree}
                  onChange={handleInputChange}
                />
                <label htmlFor="termsAgree">I agree to the privacy policy and data processing terms.</label>
              </div>
              <button className="primary-btn full-width" disabled={submitting} type="submit">
                {submitting ? 'Processing...' : 'Submit Inquiry'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Home;
