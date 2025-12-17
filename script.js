// Complete Creamo Homepage and Cipher Tool
class CreamoApp {
    constructor() {
        this.currentView = 'home';
        this.binaryContainer = document.getElementById('binaryContainer');
        this.archivesModal = document.getElementById('archivesModal');
        this.portalModal = document.getElementById('portalModal');
        this.archivesContent = document.getElementById('archivesContent');
        this.homeContainer = document.querySelector('.home-container');
        this.creamocryptTool = document.getElementById('creamocryptTool');
        this.creamotvTool = document.getElementById('creamotvTool');
        this.tvInitialized = false;
        
        // TMDB Configuration - YOU NEED TO GET YOUR OWN API KEY FROM https://www.themoviedb.org/
        this.TMDB_API_KEY = 'f38b4f347bb1169cfede0acd87486fe8'; // REPLACE THIS!
        this.TMDB_BASE_URL = 'https://api.themoviedb.org/3';
        this.TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
        
        // Cache for fetched data
        this.movieCache = new Map();
        this.tvCache = new Map();
        
        // Pagination and search
        this.moviePage = 1;
        this.tvPage = 1;
        this.searchQuery = '';
        this.currentSearchType = null;
        this.currentCategory = 'all';
        
        this.init();
    }

    init() {
        this.setupHomepage();
        this.setupCipherTool();
        this.animateGiantText();
        this.createBackgroundBinary();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close archives modal with X button
        document.getElementById('closeArchives').addEventListener('click', () => {
            this.hideArchivesModal();
        });

        // Close portal modal with X button
        document.getElementById('closePortal').addEventListener('click', () => {
            this.hidePortalModal();
        });

        // Close modals when clicking outside
        this.archivesModal.addEventListener('click', (e) => {
            if (e.target === this.archivesModal) {
                this.hideArchivesModal();
            }
        });

        this.portalModal.addEventListener('click', (e) => {
            if (e.target === this.portalModal) {
                this.hidePortalModal();
            }
        });
    }

    setupHomepage() {
        // CreamoCrypt button - show cipher tool
        document.getElementById('creamocryptBtn').addEventListener('click', (e) => {
            this.triggerBinaryAnimation(e);
            setTimeout(() => {
                this.showCipherTool();
            }, 800);
        });

        // Pen Archives button - load Archives.txt
        document.getElementById('archivesBtn').addEventListener('click', (e) => {
            this.triggerBinaryAnimation(e);
            this.loadArchivesFile();
        });

        // Portal button - show portal modal
        document.getElementById('portalBtn').addEventListener('click', (e) => {
            this.triggerBinaryAnimation(e);
            this.showPortalModal();
        });

        // Creamo TV button - show TV platform
        document.getElementById('tvBtn').addEventListener('click', (e) => {
            this.triggerBinaryAnimation(e);
            setTimeout(() => {
                this.showCreamoTV();
            }, 800);
        });

        // Portal menu options
        document.getElementById('deluxtablePortal').addEventListener('click', (e) => {
            this.triggerBinaryAnimation(e);
            setTimeout(() => {
                window.open('https://deluxtable.pages.dev', '_blank');
                this.hidePortalModal();
            }, 800);
        });

        document.getElementById('brainrotPortal').addEventListener('click', (e) => {
            this.triggerBinaryAnimation(e);
            setTimeout(() => {
                window.open('https://iankingsigma.github.io/tekken-8-website/', '_blank');
                this.hidePortalModal();
            }, 800);
        });

        document.getElementById('controlCentrePortal').addEventListener('click', (e) => {
            this.triggerBinaryAnimation(e);
            setTimeout(() => {
                window.open('https://controlc.pages.dev', '_blank');
                this.hidePortalModal();
            }, 800);
        });

        // Setup button animations
        const buttons = document.querySelectorAll('.home-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.createRipple(e, btn);
            });
        });
    }

    setupCipherTool() {
        // Back to home button
        document.getElementById('backToHome').addEventListener('click', () => {
            this.showHomepage();
        });

        // Initialize cipher tool
        this.cipherTool = new CipherTool();
    }

    setupCreamoTV() {
        // Back button for TV
        const tvBackBtn = document.createElement('button');
        tvBackBtn.className = 'tv-back-btn';
        tvBackBtn.innerHTML = '&larr; Back to Creamo';
        tvBackBtn.addEventListener('click', () => {
            this.showHomepage();
        });

        // TV Navigation with Search Bar
        const tvNav = document.createElement('div');
        tvNav.className = 'tv-nav';
        tvNav.innerHTML = `
            ${tvBackBtn.outerHTML}
            <h1 class="tv-nav-title">Creamo TV</h1>
            
            <!-- Search Bar -->
            <div class="tv-search-container">
                <input type="text" 
                       id="tvSearchInput" 
                       class="search-input" 
                       placeholder="Search movies & shows..." 
                       aria-label="Search for movies and TV shows">
                <button id="tvSearchBtn" class="player-btn" style="white-space: nowrap;">Search</button>
                <button id="tvClearSearch" class="player-btn outline" style="white-space: nowrap; display: none;">Clear</button>
            </div>
            
            <div style="margin-left: auto; display: flex; gap: 10px;">
                <button class="player-btn" id="tvHomeBtn">Home</button>
                <button class="player-btn" id="tvMoviesBtn">Movies</button>
                <button class="player-btn" id="tvShowsBtn">TV Shows</button>
                <button class="player-btn" id="tvTrendingBtn">Trending</button>
            </div>
        `;

        // TV Content Container
        const tvContent = document.createElement('div');
        tvContent.id = 'tvContent';
        tvContent.className = 'tv-content';

        // Insert into TV container
        this.creamotvTool.innerHTML = '';
        this.creamotvTool.appendChild(tvNav);
        this.creamotvTool.appendChild(tvContent);

        // Load initial TV content
        this.loadTVHome();

        // Setup TV navigation
        document.getElementById('tvHomeBtn').addEventListener('click', () => {
            this.resetSearch();
            this.loadTVHome();
        });
        document.getElementById('tvMoviesBtn').addEventListener('click', () => {
            this.resetSearch();
            this.loadTVMovies();
        });
        document.getElementById('tvShowsBtn').addEventListener('click', () => {
            this.resetSearch();
            this.loadTVShows();
        });
        document.getElementById('tvTrendingBtn').addEventListener('click', () => {
            this.resetSearch();
            this.loadTVTrending();
        });

        // Setup search functionality
        this.setupTVSearch();
        
        this.tvInitialized = true;
    }

    setupTVSearch() {
        const searchInput = document.getElementById('tvSearchInput');
        const searchBtn = document.getElementById('tvSearchBtn');
        const clearBtn = document.getElementById('tvClearSearch');

        // Search on button click
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                this.searchTVContent(query);
            }
        });

        // Search on Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    this.searchTVContent(query);
                }
            }
        });

        // Clear search
        clearBtn.addEventListener('click', () => {
            this.resetSearch();
            searchInput.value = '';
            clearBtn.style.display = 'none';
            
            // Go back to the last view
            if (this.currentSearchType === 'movie') {
                this.loadTVMovies();
            } else if (this.currentSearchType === 'tv') {
                this.loadTVShows();
            } else {
                this.loadTVHome();
            }
        });

        // Show clear button when there's text
        searchInput.addEventListener('input', () => {
            clearBtn.style.display = searchInput.value.trim() ? 'inline-block' : 'none';
        });
    }

    async searchTVContent(query, type = 'multi') {
        const tvContent = document.getElementById('tvContent');
        this.searchQuery = query;
        
        tvContent.innerHTML = `
            <div class="loading-section">
                <div class="loading-spinner"></div>
                <p>Searching for "${query}"...</p>
            </div>
        `;

        try {
            const endpoint = type === 'multi' ? 
                `search/multi?query=${encodeURIComponent(query)}&include_adult=false` :
                `search/${type}?query=${encodeURIComponent(query)}&include_adult=false`;
            
            const searchResults = await this.fetchTMDBData(endpoint);
            
            if (searchResults.results.length === 0) {
                tvContent.innerHTML = `
                    <div class="tv-section">
                        <h2>🔍 Search Results for "${query}"</h2>
                        <div class="no-results" style="text-align: center; padding: 50px; color: #a0a0a0;">
                            <div style="font-size: 48px; margin-bottom: 20px;">🎬</div>
                            <h3>No results found</h3>
                            <p>Try a different search term</p>
                            <button class="player-btn" onclick="app.loadTVHome()" style="margin-top: 20px;">
                                Back to Home
                            </button>
                        </div>
                    </div>
                `;
                return;
            }

            // Separate movies and TV shows
            const movies = searchResults.results.filter(item => item.media_type === 'movie');
            const tvShows = searchResults.results.filter(item => item.media_type === 'tv');
            
            let content = `<div class="tv-section">
                <h2>🔍 Search Results for "${query}"</h2>
                <p style="color: #a0a0a0; margin-bottom: 20px;">
                    Found ${searchResults.results.length} results
                </p>`;
            
            if (movies.length > 0) {
                content += `
                    <h3 style="margin-top: 30px; margin-bottom: 15px; color: #e0e0e0;">🎬 Movies (${movies.length})</h3>
                    <div class="tv-content-grid">
                        ${this.generateMovieCards(movies.slice(0, 12))}
                    </div>
                `;
            }
            
            if (tvShows.length > 0) {
                content += `
                    <h3 style="margin-top: 30px; margin-bottom: 15px; color: #e0e0e0;">📺 TV Shows (${tvShows.length})</h3>
                    <div class="tv-content-grid">
                        ${this.generateShowCards(tvShows.slice(0, 12))}
                    </div>
                `;
            }
            
            content += `</div>`;
            tvContent.innerHTML = content;
            
            this.currentSearchType = type;
            this.setupTVCardInteractions();

        } catch (error) {
            console.error('Search error:', error);
            tvContent.innerHTML = `
                <div class="error-section">
                    <div class="error-icon">⚠️</div>
                    <h3>Search Failed</h3>
                    <p>Unable to search TMDB. Please try again later.</p>
                    <button class="player-btn" onclick="app.loadTVHome()" style="margin-top: 20px;">
                        Back to Home
                    </button>
                </div>
            `;
        }
    }

    resetSearch() {
        this.searchQuery = '';
        this.moviePage = 1;
        this.tvPage = 1;
        this.currentSearchType = null;
        this.currentCategory = 'all';
    }

    async loadTVHome() {
        const tvContent = document.getElementById('tvContent');
        tvContent.innerHTML = `
            <div class="loading-section">
                <div class="loading-spinner"></div>
                <p>Fetching trending content from TMDB...</p>
                <p class="loading-note">Using real movie data from The Movie Database</p>
            </div>
        `;

        try {
            // Fetch multiple categories in parallel
            const [trendingMovies, trendingShows, popularMovies, popularShows] = await Promise.all([
                this.fetchTMDBData('trending/movie/day'),
                this.fetchTMDBData('trending/tv/day'),
                this.fetchTMDBData('movie/popular'),
                this.fetchTMDBData('tv/popular')
            ]);

            tvContent.innerHTML = `
                <div class="tv-section">
                    <h2>🎬 Trending Movies Today</h2>
                    <div class="tv-content-grid">
                        ${this.generateMovieCards(trendingMovies.results.slice(0, 6))}
                    </div>
                </div>
                
                <div class="tv-section">
                    <h2>📺 Trending TV Shows Today</h2>
                    <div class="tv-content-grid">
                        ${this.generateShowCards(trendingShows.results.slice(0, 6))}
                    </div>
                </div>
                
                <div class="tv-section">
                    <h2>🎥 Popular Movies</h2>
                    <div class="tv-content-grid">
                        ${this.generateMovieCards(popularMovies.results.slice(0, 6))}
                    </div>
                </div>
                
                <div class="tv-section">
                    <h2>🎞️ Popular TV Shows</h2>
                    <div class="tv-content-grid">
                        ${this.generateShowCards(popularShows.results.slice(0, 6))}
                    </div>
                </div>
                
                <div class="tv-player">
                    <div class="player-placeholder">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="#d4af37">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                        <p style="margin-top: 20px; font-size: 18px;">Ready to Stream</p>
                        <p style="font-size: 14px; opacity: 0.7;">Click any movie or show to start playing</p>
                    </div>
                    <div class="player-info">
                        <h3>Creamo TV Streaming</h3>
                        <p>Powered by TMDB API + Vidking Player</p>
                        <div class="player-stats">
                            <div class="stat">
                                <span class="stat-value">${trendingMovies.results.length + popularMovies.results.length}</span>
                                <span class="stat-label">Movies Available</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${trendingShows.results.length + popularShows.results.length}</span>
                                <span class="stat-label">TV Shows</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">Real-Time</span>
                                <span class="stat-label">Data Updates</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.setupTVCardInteractions();

        } catch (error) {
            this.showTMDBError(tvContent, error);
        }
    }

    async loadTVMovies(page = 1) {
        const tvContent = document.getElementById('tvContent');
        tvContent.innerHTML = `
            <div class="loading-section">
                <div class="loading-spinner"></div>
                <p>Loading movies from TMDB...</p>
            </div>
        `;

        try {
            const movies = await this.fetchTMDBData(`movie/popular?page=${page}`);
            this.moviePage = page;
            
            const loadMoreBtn = page > 1 ? `
                <div class="load-more-container">
                    <button class="load-more-btn" onclick="app.loadMoreMovies(${page + 1})">
                        Load More Movies (Page ${page + 1})
                    </button>
                    <button class="load-more-btn outline" onclick="app.loadTVMovies(1)" style="margin-left: 10px;">
                        Back to First Page
                    </button>
                </div>
            ` : `
                <div class="load-more-container">
                    <button class="load-more-btn" onclick="app.loadMoreMovies(2)">
                        Load More Movies
                    </button>
                </div>
            `;
            
            tvContent.innerHTML = `
                <div class="tv-section">
                    <h2>🎬 All Movies</h2>
                    <p style="color: #a0a0a0; margin-bottom: 20px;">
                        Page ${page} • ${movies.total_results} movies total
                    </p>
                    <div class="category-filter">
                        <button class="filter-btn ${this.currentCategory === 'all' ? 'active' : ''}" onclick="app.setCategory('all')">All</button>
                        <button class="filter-btn ${this.currentCategory === 'action' ? 'active' : ''}" onclick="app.filterByGenre(28, 'Action')">Action</button>
                        <button class="filter-btn ${this.currentCategory === 'drama' ? 'active' : ''}" onclick="app.filterByGenre(18, 'Drama')">Drama</button>
                        <button class="filter-btn ${this.currentCategory === 'comedy' ? 'active' : ''}" onclick="app.filterByGenre(35, 'Comedy')">Comedy</button>
                        <button class="filter-btn ${this.currentCategory === 'sci-fi' ? 'active' : ''}" onclick="app.filterByGenre(878, 'Sci-Fi')">Sci-Fi</button>
                        <button class="filter-btn ${this.currentCategory === 'horror' ? 'active' : ''}" onclick="app.filterByGenre(27, 'Horror')">Horror</button>
                    </div>
                    <div class="tv-content-grid" id="moviesGrid">
                        ${this.generateMovieCards(movies.results)}
                    </div>
                    ${loadMoreBtn}
                </div>
            `;

            this.setupTVCardInteractions();

        } catch (error) {
            this.showTMDBError(tvContent, error);
        }
    }

    async loadMoreMovies(nextPage) {
        try {
            const movies = await this.fetchTMDBData(`movie/popular?page=${nextPage}`);
            
            // Append new movies to existing grid
            const moviesGrid = document.getElementById('moviesGrid');
            if (moviesGrid) {
                moviesGrid.innerHTML += this.generateMovieCards(movies.results);
                
                // Update load more button
                const loadMoreContainer = document.querySelector('.load-more-container');
                if (loadMoreContainer && movies.page < movies.total_pages) {
                    loadMoreContainer.innerHTML = `
                        <button class="load-more-btn" onclick="app.loadMoreMovies(${nextPage + 1})">
                            Load More Movies (Page ${nextPage + 1})
                        </button>
                        <button class="load-more-btn outline" onclick="app.loadTVMovies(1)" style="margin-left: 10px;">
                            Back to First Page
                        </button>
                        <p style="margin-top: 10px; color: #a0a0a0; font-size: 12px;">
                            Loaded ${movies.results.length * nextPage} of ${movies.total_results} movies
                        </p>
                    `;
                } else {
                    loadMoreContainer.innerHTML = `
                        <p style="color: #a0a0a0;">All ${movies.total_results} movies loaded!</p>
                        <button class="load-more-btn outline" onclick="app.loadTVMovies(1)" style="margin-top: 10px;">
                            Back to First Page
                        </button>
                    `;
                }
            }
            
            this.setupTVCardInteractions();
            
        } catch (error) {
            console.error('Error loading more movies:', error);
            alert('Failed to load more movies. Please try again.');
        }
    }

    async loadTVShows(page = 1) {
        const tvContent = document.getElementById('tvContent');
        tvContent.innerHTML = `
            <div class="loading-section">
                <div class="loading-spinner"></div>
                <p>Loading TV shows from TMDB...</p>
            </div>
        `;

        try {
            const shows = await this.fetchTMDBData(`tv/popular?page=${page}`);
            this.tvPage = page;
            
            const loadMoreBtn = page > 1 ? `
                <div class="load-more-container">
                    <button class="load-more-btn" onclick="app.loadMoreShows(${page + 1})">
                        Load More Shows (Page ${page + 1})
                    </button>
                    <button class="load-more-btn outline" onclick="app.loadTVShows(1)" style="margin-left: 10px;">
                        Back to First Page
                    </button>
                </div>
            ` : `
                <div class="load-more-container">
                    <button class="load-more-btn" onclick="app.loadMoreShows(2)">
                        Load More Shows
                    </button>
                </div>
            `;
            
            tvContent.innerHTML = `
                <div class="tv-section">
                    <h2>📺 TV Shows</h2>
                    <p style="color: #a0a0a0; margin-bottom: 20px;">
                        Page ${page} • ${shows.total_results} shows total
                    </p>
                    <div class="tv-content-grid" id="showsGrid">
                        ${this.generateShowCards(shows.results)}
                    </div>
                    ${loadMoreBtn}
                </div>
            `;

            this.setupTVCardInteractions();

        } catch (error) {
            this.showTMDBError(tvContent, error);
        }
    }

    async loadMoreShows(nextPage) {
        try {
            const shows = await this.fetchTMDBData(`tv/popular?page=${nextPage}`);
            
            // Append new shows to existing grid
            const showsGrid = document.getElementById('showsGrid');
            if (showsGrid) {
                showsGrid.innerHTML += this.generateShowCards(shows.results);
                
                // Update load more button
                const loadMoreContainer = document.querySelector('.load-more-container');
                if (loadMoreContainer && shows.page < shows.total_pages) {
                    loadMoreContainer.innerHTML = `
                        <button class="load-more-btn" onclick="app.loadMoreShows(${nextPage + 1})">
                            Load More Shows (Page ${nextPage + 1})
                        </button>
                        <button class="load-more-btn outline" onclick="app.loadTVShows(1)" style="margin-left: 10px;">
                            Back to First Page
                        </button>
                        <p style="margin-top: 10px; color: #a0a0a0; font-size: 12px;">
                            Loaded ${shows.results.length * nextPage} of ${shows.total_results} shows
                        </p>
                    `;
                } else {
                    loadMoreContainer.innerHTML = `
                        <p style="color: #a0a0a0;">All ${shows.total_results} shows loaded!</p>
                        <button class="load-more-btn outline" onclick="app.loadTVShows(1)" style="margin-top: 10px;">
                            Back to First Page
                        </button>
                    `;
                }
            }
            
            this.setupTVCardInteractions();
            
        } catch (error) {
            console.error('Error loading more shows:', error);
            alert('Failed to load more shows. Please try again.');
        }
    }

    async loadTVTrending() {
        const tvContent = document.getElementById('tvContent');
        tvContent.innerHTML = `
            <div class="loading-section">
                <div class="loading-spinner"></div>
                <p>Loading trending content...</p>
            </div>
        `;

        try {
            const [trendingAll, trendingMovies, trendingShows] = await Promise.all([
                this.fetchTMDBData('trending/all/day'),
                this.fetchTMDBData('trending/movie/day'),
                this.fetchTMDBData('trending/tv/day')
            ]);

            tvContent.innerHTML = `
                <div class="tv-section">
                    <h2>🔥 Trending Now</h2>
                    <div class="tv-content-grid">
                        ${this.generateTrendingCards(trendingAll.results.slice(0, 12))}
                    </div>
                </div>
                
                <div class="tv-section">
                    <h2>📈 Movie Trends</h2>
                    <div class="tv-content-grid">
                        ${this.generateMovieCards(trendingMovies.results.slice(0, 6))}
                    </div>
                </div>
                
                <div class="tv-section">
                    <h2>📊 TV Trends</h2>
                    <div class="tv-content-grid">
                        ${this.generateShowCards(trendingShows.results.slice(0, 6))}
                    </div>
                </div>
            `;

            this.setupTVCardInteractions();

        } catch (error) {
            this.showTMDBError(tvContent, error);
        }
    }

    setCategory(category) {
        this.currentCategory = category;
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase() === category) {
                btn.classList.add('active');
            }
        });
    }

    async filterByGenre(genreId, genreName) {
        const tvContent = document.getElementById('tvContent');
        tvContent.innerHTML = `
            <div class="loading-section">
                <div class="loading-spinner"></div>
                <p>Loading ${genreName} movies...</p>
            </div>
        `;

        try {
            const movies = await this.fetchTMDBData(`discover/movie?with_genres=${genreId}&sort_by=popularity.desc`);
            this.currentCategory = genreName.toLowerCase();
            
            tvContent.innerHTML = `
                <div class="tv-section">
                    <h2>🎬 ${genreName} Movies</h2>
                    <p style="color: #a0a0a0; margin-bottom: 20px;">
                        ${movies.results.length} ${genreName.toLowerCase()} movies
                    </p>
                    <div class="category-filter">
                        <button class="filter-btn" onclick="app.loadTVMovies()">← All Movies</button>
                        <button class="filter-btn active">${genreName}</button>
                    </div>
                    <div class="tv-content-grid">
                        ${this.generateMovieCards(movies.results.slice(0, 20))}
                    </div>
                    ${movies.results.length > 20 ? `
                        <div class="load-more-container">
                            <p style="color: #a0a0a0;">Showing 20 of ${movies.results.length} ${genreName.toLowerCase()} movies</p>
                        </div>
                    ` : ''}
                </div>
            `;

            this.setupTVCardInteractions();
            
        } catch (error) {
            console.error('Error filtering by genre:', error);
            tvContent.innerHTML = `
                <div class="error-section">
                    <div class="error-icon">⚠️</div>
                    <h3>Failed to Load ${genreName} Movies</h3>
                    <p>Please try again later.</p>
                    <button class="player-btn" onclick="app.loadTVMovies()" style="margin-top: 20px;">
                        Back to All Movies
                    </button>
                </div>
            `;
        }
    }

    async fetchTMDBData(endpoint) {
        const cacheKey = endpoint;
        
        // Check cache first
        if (this.movieCache.has(cacheKey)) {
            const cached = this.movieCache.get(cacheKey);
            if (Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minute cache
                return cached.data;
            }
        }

        const url = `${this.TMDB_BASE_URL}/${endpoint}?api_key=${this.TMDB_API_KEY}&language=en-US&page=1`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`TMDB API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Cache the data
        this.movieCache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });
        
        return data;
    }

    generateMovieCards(movies) {
        return movies.map(movie => `
            <div class="movie-card" data-id="${movie.id}" data-type="movie">
                <div class="movie-poster">
                    ${movie.poster_path ? 
                        `<img src="${this.TMDB_IMAGE_URL}${movie.poster_path}" alt="${movie.title}" loading="lazy">` :
                        `<div class="no-poster">${movie.title}</div>`
                    }
                    <div class="play-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#051225">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                    <div class="movie-overlay"></div>
                </div>
                <div class="movie-info">
                    <h3 title="${movie.title}">${movie.title}</h3>
                    <div class="movie-meta">
                        <span>${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</span>
                        <span class="rating">★ ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                        ${movie.vote_count > 1000 ? '<span class="popular-badge">Popular</span>' : ''}
                    </div>
                    <p class="movie-overview">${movie.overview ? movie.overview.substring(0, 100) + '...' : 'No description available'}</p>
                </div>
            </div>
        `).join('');
    }

    generateShowCards(shows) {
        return shows.map(show => `
            <div class="show-card" data-id="${show.id}" data-type="tv">
                <div class="show-poster">
                    ${show.poster_path ? 
                        `<img src="${this.TMDB_IMAGE_URL}${show.poster_path}" alt="${show.name}" loading="lazy">` :
                        `<div class="no-poster">${show.name}</div>`
                    }
                    <div class="play-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#051225">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                    <div class="show-overlay"></div>
                </div>
                <div class="show-info">
                    <h3 title="${show.name}">${show.name}</h3>
                    <div class="show-meta">
                        <span>${show.first_air_date ? show.first_air_date.split('-')[0] : 'N/A'}</span>
                        <span class="rating">★ ${show.vote_average ? show.vote_average.toFixed(1) : 'N/A'}</span>
                        <span class="quality-badge">TV</span>
                    </div>
                    <p class="show-overview">${show.overview ? show.overview.substring(0, 100) + '...' : 'No description available'}</p>
                </div>
            </div>
        `).join('');
    }

    generateTrendingCards(items) {
        return items.map((item, index) => `
            <div class="trending-card ${index < 3 ? 'top-three' : ''}" data-id="${item.id}" data-type="${item.media_type}">
                <div class="trending-rank">#${index + 1}</div>
                <div class="trending-poster">
                    ${item.poster_path ? 
                        `<img src="${this.TMDB_IMAGE_URL}${item.poster_path}" alt="${item.title || item.name}" loading="lazy">` :
                        `<div class="no-poster">${item.title || item.name}</div>`
                    }
                </div>
                <div class="trending-info">
                    <h4>${item.title || item.name}</h4>
                    <p class="trending-type">${item.media_type === 'movie' ? '🎬 Movie' : '📺 TV Show'}</p>
                    <span class="trending-rating">★ ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</span>
                </div>
            </div>
        `).join('');
    }

    setupTVCardInteractions() {
        setTimeout(() => {
            document.querySelectorAll('.movie-card, .show-card, .trending-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    const id = card.dataset.id;
                    const type = card.dataset.type;
                    const title = card.querySelector('h3, h4').textContent;
                    
                    if (type === 'movie') {
                        this.playMovie(id, title);
                    } else {
                        this.playTVShow(id, title);
                    }
                });
            });
        }, 100);
    }

    playMovie(movieId, title) {
        const tvContent = document.getElementById('tvContent');
        
        // Vidking Player URL for movies
        const vidkingUrl = `https://www.vidking.net/embed/movie/${movieId}?color=d4af37&autoPlay=true`;
        
        tvContent.innerHTML = `
            <div class="tv-player">
                <div class="player-header">
                    <h2>🎬 Now Playing: ${title}</h2>
                    <button class="player-btn" onclick="app.loadTVHome()">← Back to Library</button>
                </div>
                
                <div class="vidking-player-container">
                    <iframe 
                        src="${vidkingUrl}" 
                        width="100%" 
                        height="600" 
                        frameborder="0" 
                        allowfullscreen
                        class="vidking-player"
                        title="Vidking Player - ${title}"
                    ></iframe>
                </div>
                
                <div class="player-info">
                    <h3>${title}</h3>
                    <p>Streaming via Vidking Player with real-time progress tracking</p>
                    
                    <div class="player-features">
                        <div class="feature">
                            <span class="feature-icon">🎯</span>
                            <span class="feature-text">4K/HDR Support</span>
                        </div>
                        <div class="feature">
                            <span class="feature-icon">📊</span>
                            <span class="feature-text">Progress Tracking</span>
                        </div>
                        <div class="feature">
                            <span class="feature-icon">⚡</span>
                            <span class="feature-text">Fast Streaming</span>
                        </div>
                    </div>
                    
                    <div class="player-controls">
                        <button class="player-btn primary" onclick="app.loadTVMovies()">Browse More Movies</button>
                        <button class="player-btn" onclick="app.loadTVShows()">Switch to TV Shows</button>
                    </div>
                </div>
            </div>
        `;
    }

    playTVShow(showId, title, season = 1, episode = 1) {
        const tvContent = document.getElementById('tvContent');
        
        // Vidking Player URL for TV shows
        const vidkingUrl = `https://www.vidking.net/embed/tv/${showId}/${season}/${episode}?color=d4af37&autoPlay=true&nextEpisode=true&episodeSelector=true`;
        
        tvContent.innerHTML = `
            <div class="tv-player">
                <div class="player-header">
                    <h2>📺 Now Playing: ${title}</h2>
                    <button class="player-btn" onclick="app.loadTVHome()">← Back to Library</button>
                </div>
                
                <div class="vidking-player-container">
                    <iframe 
                        src="${vidkingUrl}" 
                        width="100%" 
                        height="600" 
                        frameborder="0" 
                        allowfullscreen
                        class="vidking-player"
                        title="Vidking Player - ${title}"
                    ></iframe>
                </div>
                
                <div class="player-info">
                    <h3>${title} - S${season}E${episode}</h3>
                    <p>TV series with episode navigation and auto-play next episode</p>
                    
                    <div class="season-selector">
                        <label>Season:</label>
                        <select id="seasonSelect" onchange="app.changeSeason(${showId}, this.value)">
                            ${Array.from({length: 5}, (_, i) => `
                                <option value="${i + 1}" ${i + 1 === season ? 'selected' : ''}>Season ${i + 1}</option>
                            `).join('')}
                        </select>
                        
                        <label style="margin-left: 20px;">Episode:</label>
                        <select id="episodeSelect" onchange="app.changeEpisode(${showId}, ${season}, this.value)">
                            ${Array.from({length: 10}, (_, i) => `
                                <option value="${i + 1}" ${i + 1 === episode ? 'selected' : ''}>Episode ${i + 1}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="player-controls">
                        <button class="player-btn primary" onclick="app.loadTVShows()">Browse More Shows</button>
                        <button class="player-btn" onclick="app.loadTVMovies()">Switch to Movies</button>
                    </div>
                </div>
            </div>
        `;
    }

    changeSeason(showId, season) {
        const episodeSelect = document.getElementById('episodeSelect');
        const episode = episodeSelect.value;
        this.playTVShow(showId, 'TV Show', parseInt(season), parseInt(episode));
    }

    changeEpisode(showId, season, episode) {
        this.playTVShow(showId, 'TV Show', parseInt(season), parseInt(episode));
    }

    showTMDBError(container, error) {
        container.innerHTML = `
            <div class="error-section">
                <div class="error-icon">⚠️</div>
                <h3>TMDB API Connection Failed</h3>
                <p>Unable to fetch movie data. Please check your TMDB API key.</p>
                <p class="error-details">Error: ${error.message}</p>
                
                <div class="error-instructions">
                    <h4>How to fix:</h4>
                    <ol>
                        <li>Go to <a href="https://www.themoviedb.org/" target="_blank">TMDB.org</a></li>
                        <li>Create an account and get an API key</li>
                        <li>Replace "f38b4f347bb1169cfede0acd87486fe8" in script.js with your key</li>
                        <li>Refresh the page</li>
                    </ol>
                </div>
                
                <div class="fallback-content">
                    <h4>Using Fallback Example Content:</h4>
                    <div class="tv-content-grid">
                        ${this.generateFallbackMovies()}
                    </div>
                </div>
            </div>
        `;
        
        this.setupTVCardInteractions();
    }

    generateFallbackMovies() {
        const fallbackMovies = [
            { id: '299534', title: 'Rebel Ridge', release_date: '2024', vote_average: 8.5 },
            { id: '1078605', title: 'Hit Man', release_date: '2024', vote_average: 9.1 },
            { id: '693134', title: 'Dune: Part Two', release_date: '2024', vote_average: 8.3 },
            { id: '872585', title: 'Oppenheimer', release_date: '2023', vote_average: 8.8 },
            { id: '119051', title: 'The Boys', first_air_date: '2019', vote_average: 8.7, media_type: 'tv' },
            { id: '66732', title: 'Stranger Things', first_air_date: '2016', vote_average: 8.7, media_type: 'tv' }
        ];
        
        return fallbackMovies.map(movie => `
            <div class="movie-card" data-id="${movie.id}" data-type="${movie.media_type || 'movie'}">
                <div class="movie-poster">
                    <div class="no-poster">${movie.title}</div>
                    <div class="play-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#051225">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <div class="movie-meta">
                        <span>${movie.release_date || movie.first_air_date}</span>
                        <span class="rating">★ ${movie.vote_average}</span>
                    </div>
                    <p class="movie-overview">${movie.media_type === 'tv' ? 'Popular TV Series' : 'Featured Movie'}</p>
                </div>
            </div>
        `).join('');
    }

    filterContent(genre) {
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase() === genre) {
                btn.classList.add('active');
            }
        });
        
        // In a real app, you would filter the movies
        // For now, just show a message
        const grid = document.getElementById('moviesGrid');
        if (genre !== 'all') {
            grid.innerHTML += `<div class="filter-message">Filtering by ${genre} would work with full API integration</div>`;
        }
    }

    showCipherTool() {
        this.currentView = 'cipher';
        this.homeContainer.style.display = 'none';
        this.creamocryptTool.style.display = 'block';
        this.creamotvTool.style.display = 'none';
        document.querySelector('.site-header').style.display = 'none';
        document.querySelector('.site-footer').style.display = 'none';
    }

    showCreamoTV() {
        this.currentView = 'tv';
        this.homeContainer.style.display = 'none';
        this.creamocryptTool.style.display = 'none';
        this.creamotvTool.style.display = 'block';
        document.querySelector('.site-header').style.display = 'none';
        document.querySelector('.site-footer').style.display = 'none';
        
        if (!this.tvInitialized) {
            this.setupCreamoTV();
            this.tvInitialized = true;
        }
    }

    showHomepage() {
        this.currentView = 'home';
        this.homeContainer.style.display = 'flex';
        this.creamocryptTool.style.display = 'none';
        this.creamotvTool.style.display = 'none';
        document.querySelector('.site-header').style.display = 'flex';
        document.querySelector('.site-footer').style.display = 'block';
    }

    showPortalModal() {
        if (this.portalModal) {
            this.portalModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    hidePortalModal() {
        if (this.portalModal) {
            this.portalModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    createRipple(event, button) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(26, 60, 139, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 1;
        `;

        button.appendChild(ripple);

        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    triggerBinaryAnimation(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        const startX = rect.left + (rect.width / 2);
        const startY = rect.bottom;
        
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                this.createBinaryStream(startX, startY, i);
            }, i * 80);
        }
    }

    createBinaryStream(startX, startY, index) {
        const binaryElement = document.createElement('div');
        binaryElement.className = 'binary-code';
        
        let binaryString = '';
        const length = 15 + Math.floor(Math.random() * 10);
        for (let i = 0; i < length; i++) {
            binaryString += Math.random() > 0.5 ? '1' : '0';
        }
        
        binaryElement.textContent = binaryString;
        
        const duration = 1.5 + Math.random() * 1;
        const delay = index * 0.08;
        const rotation = -20 + Math.random() * 40;
        
        binaryElement.style.cssText = `
            left: ${startX}px;
            top: ${startY}px;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            transform: rotate(${rotation}deg);
            color: ${this.getRandomBlueColor()};
            font-size: ${12 + Math.random() * 8}px;
            opacity: ${0.7 + Math.random() * 0.3};
        `;
        
        this.binaryContainer.appendChild(binaryElement);
        
        setTimeout(() => {
            if (binaryElement.parentNode) {
                binaryElement.parentNode.removeChild(binaryElement);
            }
        }, (duration + delay) * 1000);
    }

    getRandomBlueColor() {
        const colors = [
            '#051225', '#0a1a3a', '#1a3c8b', '#0a1a3a', '#051225'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    createBackgroundBinary() {
        setInterval(() => {
            if (Math.random() > 0.7) {
                this.createBinaryStream(
                    Math.random() * window.innerWidth,
                    window.innerHeight + 50,
                    Math.floor(Math.random() * 3)
                );
            }
        }, 2000);
    }

    animateGiantText() {
        const giantText = document.getElementById('giantCreamo');
        let scale = 1;
        let growing = true;
        
        setInterval(() => {
            if (growing) {
                scale += 0.001;
                if (scale >= 1.015) growing = false;
            } else {
                scale -= 0.001;
                if (scale <= 0.985) growing = true;
            }
            giantText.style.transform = `scale(${scale})`;
        }, 50);
    }

    async loadArchivesFile() {
        try {
            this.showArchivesModal();
            this.archivesContent.innerHTML = '<div class="loading">Loading Archives.txt...</div>';
            
            const response = await fetch('Archives.txt');
            
            if (!response.ok) {
                throw new Error(`Failed to load Archives.txt: ${response.status} ${response.statusText}`);
            }
            
            const archivesData = await response.text();
            
            this.archivesContent.innerHTML = `
                <pre>${this.escapeHtml(archivesData)}</pre>
            `;
            
        } catch (error) {
            console.error('Error loading Archives.txt:', error);
            this.archivesContent.innerHTML = `
                <div class="error">
                    [ERROR] Failed to load Archives.txt<br>
                    ${error.message}<br>
                    Please ensure Archives.txt exists in the same directory.
                </div>
            `;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showArchivesModal() {
        this.archivesModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    hideArchivesModal() {
        this.archivesModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Cipher Tool Implementation
class CipherTool {
    constructor() {
        this.PBKDF2_ITERATIONS = 10000;
        this.cipherInfo = {
            base64: "Base64: Encodes text into a 64-character alphabet. Not for secrecy — transport-friendly.",
            base32: "Base32: Encodes bytes into a 32-character alphabet (RFC4648). Useful for case-insensitive tokens.",
            hex: "Hex: Encodes bytes to hexadecimal pairs. Common for binary/text interchange.",
            caesar: "Caesar: Shift letters by a numeric shift (1-25). Enter number in the key input.",
            rot13: "ROT13: Simple letter rotation (13). Symmetric and used for simple obfuscation.",
            morse: "Morse: Dots (.) and dashes (-). Use space between letters and / for word separators.",
            url: "URL Encode/Decode: Percent-encoding for transport in URLs.",
            xor: "XOR: Symmetric XOR with a repeating key. Binary-safe; output is Base64.",
            aes256: "AES-256: Encrypt/Decrypt using passphrase (CryptoJS). For PBKDF2-derived keys use AES-256 (PBKDF2).",
            "aes256-pbkdf2": "AES-256 (PBKDF2): Derive encryption key using PBKDF2 with embedded salt for stronger keying.",
            vigenere: "Vigenère: Polyalphabetic substitution using an alphabetic keyword.",
            sha256: "SHA-256: Cryptographic hash (one-way). Use under Encrypt to compute the digest.",
            md5: "MD5: Legacy hash function (one-way). Not recommended for security use-cases."
        };

        this.initCipherTool();
    }

    initCipherTool() {
        // DOM elements
        this.nativeSelect = document.getElementById('cipherSelect');
        this.customSelect = document.getElementById('customSelect');
        this.selectControl = document.getElementById('selectControl');
        this.cipherList = document.getElementById('cipherList');
        this.optionsList = document.getElementById('optionsList');
        this.cipherFilter = document.getElementById('cipherFilter');
        this.selectedLabel = document.getElementById('selectedLabel');

        this.infoContent = document.getElementById('infoContent');
        this.keyRow = document.getElementById('keyRow');
        this.keyInput = document.getElementById('keyInput');
        this.keyLabel = document.getElementById('keyLabel');
        this.saltRow = document.getElementById('saltRow');
        this.saltInput = document.getElementById('saltInput');

        this.inputText = document.getElementById('inputText');
        this.outputEl = document.getElementById('output');
        this.typedContent = document.getElementById('typedContent');
        this.caretEl = document.getElementById('caret');
        this.copyBtn = document.getElementById('copyBtn');

        this.encryptBtn = document.getElementById('encryptBtn');
        this.decryptBtn = document.getElementById('decryptBtn');
        this.clearBtn = document.getElementById('clearBtn');

        this.buildOptions();
        this.setupEventListeners();
        this.initSelection();
        this.setOutput('No output yet.');
    }

    buildOptions() {
        this.optionsList.innerHTML = '';
        for (let i = 0; i < this.nativeSelect.options.length; i++) {
            const opt = this.nativeSelect.options[i];
            const li = document.createElement('li');
            li.setAttribute('role', 'option');
            li.className = 'option';
            li.dataset.value = opt.value;
            li.tabIndex = 0;
            li.innerHTML = `<strong>${opt.textContent}</strong><small>${this.cipherInfo[opt.value] || ''}</small>`;
            this.optionsList.appendChild(li);
        }
    }

    setupEventListeners() {
        this.selectControl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.cipherList.classList.contains('hidden')) {
                this.openDropdown();
            } else {
                this.closeDropdown();
            }
        });

        this.cipherFilter.addEventListener('input', () => this.filterOptions());

        this.optionsList.addEventListener('click', (e) => {
            const li = e.target.closest('.option');
            if (!li) return;
            this.chooseOption(li.dataset.value);
            this.closeDropdown();
        });

        this.encryptBtn.addEventListener('click', () => this.encrypt());
        this.decryptBtn.addEventListener('click', () => this.decrypt());
        this.clearBtn.addEventListener('click', () => this.clear());
        this.copyBtn.addEventListener('click', () => this.copyOutput());

        document.addEventListener('click', (e) => {
            if (!this.customSelect.contains(e.target)) {
                this.closeDropdown();
            }
        });
    }

    openDropdown() {
        this.cipherList.classList.remove('hidden');
        this.customSelect.setAttribute('aria-expanded', 'true');
        this.cipherFilter.value = '';
        this.filterOptions();
        this.cipherFilter.focus();
    }

    closeDropdown() {
        this.cipherList.classList.add('hidden');
        this.customSelect.setAttribute('aria-expanded', 'false');
    }

    filterOptions() {
        const q = (this.cipherFilter.value || '').trim().toLowerCase();
        Array.from(this.optionsList.children).forEach(li => {
            const txt = li.textContent.toLowerCase();
            li.style.display = txt.includes(q) ? '' : 'none';
        });
    }

    chooseOption(value) {
        this.nativeSelect.value = value;
        this.selectedLabel.textContent = this.nativeSelect.options[this.nativeSelect.selectedIndex].textContent;
        this.updateUIForCipher();
    }

    initSelection() {
        this.selectedLabel.textContent = this.nativeSelect.options[this.nativeSelect.selectedIndex].textContent;
        this.updateUIForCipher();
    }

    updateUIForCipher() {
        const cipher = this.nativeSelect.value;
        this.infoContent.textContent = this.cipherInfo[cipher] || '';
        const needsKey = ['caesar', 'xor', 'aes256', 'aes256-pbkdf2', 'vigenere'].includes(cipher);
        this.keyRow.classList.toggle('hidden', !needsKey);
        this.saltRow.classList.toggle('hidden', cipher !== 'aes256-pbkdf2');

        if (cipher === 'caesar') {
            this.keyInput.type = 'number';
            this.keyInput.placeholder = 'Shift (numeric, default 3)';
            this.keyLabel.textContent = 'Shift';
        } else if (cipher === 'aes256' || cipher === 'aes256-pbkdf2') {
            this.keyInput.type = 'password';
            this.keyInput.placeholder = 'Passphrase (min 8 chars recommended)';
            this.keyLabel.textContent = 'Passphrase';
        } else if (cipher === 'xor') {
            this.keyInput.type = 'text';
            this.keyInput.placeholder = 'Key (text, repeated)';
            this.keyLabel.textContent = 'XOR Key';
        } else if (cipher === 'vigenere') {
            this.keyInput.type = 'text';
            this.keyInput.placeholder = 'Keyword (letters only)';
            this.keyLabel.textContent = 'Keyword';
        } else {
            this.keyInput.type = 'text';
            this.keyInput.placeholder = 'Key / Not used';
            this.keyLabel.textContent = 'Key';
        }
    }

    setOutput(text, isError=false) {
        try {
            text = String(text || '');
            this.showInstant(text);
            this.outputEl.classList.toggle('error', !!isError);
        } catch (err) {
            this.showInstant(String(text));
            this.outputEl.classList.toggle('error', true);
        }
    }

    showInstant(text) {
        this.typedContent.textContent = text;
        this.caretEl.style.visibility = 'hidden';
        this.copyBtn.style.display = text ? 'inline-block' : 'none';
    }

    copyOutput() {
        const text = this.typedContent.textContent || '';
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            this.copyBtn.textContent = 'Copied';
            setTimeout(() => this.copyBtn.textContent = 'Copy', 1200);
        }).catch(() => {
            alert('Copy failed — select & copy manually.');
        });
    }

    clear() {
        this.inputText.value = '';
        this.keyInput.value = '';
        this.saltInput.value = '';
        this.setOutput('No output yet.');
        this.inputText.focus();
    }

    encrypt() {
        const cipher = this.nativeSelect.value;
        const input = this.inputText.value || '';
        const key = this.keyInput.value || '';
        const salt = this.saltInput.value || '';
        try {
            if (!input) throw new Error('Please provide input text.');
            let out = '';
            switch (cipher) {
                case 'base64': out = this.base64EncodeUnicode(input); break;
                case 'base32': out = this.base32Encode(input); break;
                case 'hex': out = this.hexEncode(input); break;
                case 'caesar': {
                    const s = Number(key);
                    out = this.caesarCipher(input, Number.isFinite(s) ? s : 3); break;
                }
                case 'rot13': out = this.rot13(input); break;
                case 'morse': out = this.toMorse(input); break;
                case 'url': out = this.urlEncode(input); break;
                case 'xor': out = this.xorEncrypt(input, key); break;
                case 'aes256': {
                    if (!key || key.length < 8) throw new Error('AES requires a passphrase (min 8 chars).');
                    out = this.aesEncryptPassphrase(input, key); break;
                }
                case 'aes256-pbkdf2': {
                    if (!key || key.length < 8) throw new Error('AES-PBKDF2 requires a passphrase (min 8 chars).');
                    out = this.aesEncryptPBKDF2(input, key, this.PBKDF2_ITERATIONS); break;
                }
                case 'vigenere': out = this.vigenereCipher(input, key, true); break;
                case 'sha256': out = this.sha256Hash(input); break;
                case 'md5': out = this.md5Hash(input); break;
                default: throw new Error('Unknown cipher');
            }
            this.setOutput(out, false);
        } catch (e) {
            this.setOutput('Error: ' + (e && e.message ? e.message : String(e)), true);
        }
    }

    decrypt() {
        const cipher = this.nativeSelect.value;
        const input = this.inputText.value || '';
        const key = this.keyInput.value || '';
        const salt = this.saltInput.value || '';
        try {
            if (!input) throw new Error('Please provide input text.');
            let out = '';
            switch (cipher) {
                case 'base64': out = this.base64DecodeUnicode(input); break;
                case 'base32': out = this.base32Decode(input); break;
                case 'hex': out = this.hexDecode(input); break;
                case 'caesar': {
                    const s = Number(key);
                    out = this.caesarCipher(input, Number.isFinite(s) ? -s : -3); break;
                }
                case 'rot13': out = this.rot13(input); break;
                case 'morse': out = this.fromMorse(input); break;
                case 'url': out = this.urlDecode(input); break;
                case 'xor': out = this.xorDecrypt(input, key); break;
                case 'aes256': {
                    if (!key || key.length < 8) throw new Error('AES requires a passphrase (min 8 chars).');
                    out = this.aesDecryptPassphrase(input, key); break;
                }
                case 'aes256-pbkdf2': {
                    if (!key || key.length < 8) throw new Error('AES-PBKDF2 requires a passphrase (min 8 chars).');
                    out = this.aesDecryptPBKDF2(input, key, this.PBKDF2_ITERATIONS); break;
                }
                case 'vigenere': out = this.vigenereCipher(input, key, false); break;
                case 'sha256':
                case 'md5':
                    throw new Error('Hashes are one-way and cannot be decrypted.');
                default: throw new Error('Unknown cipher');
            }
            this.setOutput(out, false);
        } catch (e) {
            this.setOutput('Error: ' + (e && e.message ? e.message : String(e)), true);
        }
    }

    // Cipher implementations (kept from original)
    base64EncodeUnicode(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode('0x' + p1);
        }));
    }

    base64DecodeUnicode(str) {
        return decodeURIComponent(Array.prototype.map.call(atob(str), (c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }

    base32Encode(str) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = '';
        let output = '';
        
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i);
            bits += charCode.toString(2).padStart(8, '0');
        }
        
        while (bits.length % 5 !== 0) {
            bits += '0';
        }
        
        for (let i = 0; i < bits.length; i += 5) {
            const chunk = bits.substr(i, 5);
            const index = parseInt(chunk, 2);
            output += alphabet[index];
        }
        
        while (output.length % 8 !== 0) {
            output += '=';
        }
        
        return output;
    }

    base32Decode(str) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        str = str.toUpperCase().replace(/=+$/, '');
        let bits = '';
        let output = '';
        
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            const index = alphabet.indexOf(char);
            if (index === -1) throw new Error('Invalid Base32 character');
            bits += index.toString(2).padStart(5, '0');
        }
        
        for (let i = 0; i < bits.length; i += 8) {
            const chunk = bits.substr(i, 8);
            if (chunk.length < 8) break;
            const charCode = parseInt(chunk, 2);
            output += String.fromCharCode(charCode);
        }
        
        return output;
    }

    hexEncode(str) {
        let hex = '';
        for (let i = 0; i < str.length; i++) {
            hex += str.charCodeAt(i).toString(16).padStart(2, '0');
        }
        return hex.toUpperCase();
    }

    hexDecode(hex) {
        hex = hex.replace(/\s/g, '');
        if (hex.length % 2 !== 0) {
            throw new Error('Invalid hex string');
        }
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
    }

    caesarCipher(str, shift) {
        return str.replace(/[a-z]/gi, (char) => {
            const code = char.charCodeAt(0);
            const isUpper = code >= 65 && code <= 90;
            const base = isUpper ? 65 : 97;
            return String.fromCharCode(((code - base + shift + 26) % 26) + base);
        });
    }

    rot13(str) {
        return this.caesarCipher(str, 13);
    }

    toMorse(str) {
        const morseMap = {
            'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.',
            'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
            'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---',
            'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
            'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--',
            'Z': '--..', '1': '.----', '2': '..---', '3': '...--',
            '4': '....-', '5': '.....', '6': '-....', '7': '--...',
            '8': '---..', '9': '----.', '0': '-----', ' ': '/'
        };
        
        return str.toUpperCase().split('').map(char => {
            return morseMap[char] || char;
        }).join(' ');
    }

    fromMorse(morse) {
        const reverseMorse = {
            '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
            '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
            '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
            '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
            '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
            '--..': 'Z', '.----': '1', '..---': '2', '...--': '3',
            '....-': '4', '.....': '5', '-....': '6', '--...': '7',
            '---..': '8', '----.': '9', '-----': '0', '/': ' '
        };
        
        return morse.trim().split(' ').map(code => {
            return reverseMorse[code] || code;
        }).join('');
    }

    urlEncode(str) {
        return encodeURIComponent(str);
    }

    urlDecode(str) {
        return decodeURIComponent(str);
    }

    xorEncrypt(str, key) {
        if (!key) throw new Error('XOR requires a key');
        let result = '';
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            result += String.fromCharCode(charCode);
        }
        return this.base64EncodeUnicode(result);
    }

    xorDecrypt(str, key) {
        if (!key) throw new Error('XOR requires a key');
        const decoded = this.base64DecodeUnicode(str);
        let result = '';
        for (let i = 0; i < decoded.length; i++) {
            const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            result += String.fromCharCode(charCode);
        }
        return result;
    }

    aesEncryptPassphrase(str, passphrase) {
        const salt = CryptoJS.lib.WordArray.random(128/8);
        const key = CryptoJS.PBKDF2(passphrase, salt, {
            keySize: 256/32,
            iterations: 100
        });
        const iv = CryptoJS.lib.WordArray.random(128/8);
        const encrypted = CryptoJS.AES.encrypt(str, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return salt.toString() + iv.toString() + encrypted.toString();
    }

    aesDecryptPassphrase(str, passphrase) {
        const salt = CryptoJS.enc.Hex.parse(str.substr(0, 32));
        const iv = CryptoJS.enc.Hex.parse(str.substr(32, 32));
        const encrypted = str.substring(64);
        const key = CryptoJS.PBKDF2(passphrase, salt, {
            keySize: 256/32,
            iterations: 100
        });
        const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    aesEncryptPBKDF2(str, passphrase, iterations) {
        const salt = CryptoJS.lib.WordArray.random(128/8);
        const key = CryptoJS.PBKDF2(passphrase, salt, {
            keySize: 256/32,
            iterations: iterations
        });
        const iv = CryptoJS.lib.WordArray.random(128/8);
        const encrypted = CryptoJS.AES.encrypt(str, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return salt.toString() + iv.toString() + encrypted.toString();
    }

    aesDecryptPBKDF2(str, passphrase, iterations) {
        const salt = CryptoJS.enc.Hex.parse(str.substr(0, 32));
        const iv = CryptoJS.enc.Hex.parse(str.substr(32, 32));
        const encrypted = str.substring(64);
        const key = CryptoJS.PBKDF2(passphrase, salt, {
            keySize: 256/32,
            iterations: iterations
        });
        const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    vigenereCipher(str, key, encrypt = true) {
        if (!key) throw new Error('Vigenère requires a keyword');
        key = key.toUpperCase().replace(/[^A-Z]/g, '');
        if (!key) throw new Error('Keyword must contain letters');
        
        let result = '';
        let keyIndex = 0;
        
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            const charCode = char.charCodeAt(0);
            
            if (char.match(/[a-z]/i)) {
                const isUpper = charCode >= 65 && charCode <= 90;
                const base = isUpper ? 65 : 97;
                const keyChar = key[keyIndex % key.length];
                const keyShift = keyChar.charCodeAt(0) - 65;
                const shift = encrypt ? keyShift : 26 - keyShift;
                
                result += String.fromCharCode(((charCode - base + shift) % 26) + base);
                keyIndex++;
            } else {
                result += char;
            }
        }
        
        return result;
    }

    sha256Hash(str) {
        return CryptoJS.SHA256(str).toString();
    }

    md5Hash(str) {
        return CryptoJS.MD5(str).toString();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CreamoApp();
});
