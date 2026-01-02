// No authentication required

        // Get user name from localStorage
        function getUserName() {
            return localStorage.getItem('userName') || 'Guest';
        }

        // Domain persistence functions
        function saveDomains() {
            localStorage.setItem('domains', JSON.stringify(domains));
        }

        function loadDomains() {
            const saved = localStorage.getItem('domains');
            if (saved) {
                return JSON.parse(saved);
            }
            // Default domains
            return [
                { id: 1, name: 'mlikfjr.my.id', type: 'domain', category: 'Main Domain', status: 'checking', responseTime: 0, lastChecked: null },
                { id: 2, name: 'api.mlikfjr.my.id', type: 'subdomain', category: 'API Service', status: 'checking', responseTime: 0, lastChecked: null },
                { id: 3, name: 'backup.mlikfjr.my.id', type: 'subdomain', category: 'Backup Service', status: 'checking', responseTime: 0, lastChecked: null },
                { id: 4, name: 'malikvps.mlikfjr.my.id', type: 'subdomain', category: 'VPS Service', status: 'checking', responseTime: 0, lastChecked: null },
                { id: 5, name: 'kulinaai.biezz.my.id', type: 'subdomain', category: 'AI Service', status: 'checking', responseTime: 0, lastChecked: null }
            ];
        }

        // Domain data
        let domains = loadDomains();
        let currentFilter = 'all';

        let autoRefreshInterval;

        // Initialize dashboard
        function initDashboard() {
            // Set welcome message with user name
            const userName = getUserName();
            document.title = `Halo, ${userName} | Subdomain Status Dashboard`;
            document.getElementById('welcomeMessage').innerHTML = `Halo, <span class="gradient-text">${userName}</span>!`;

            renderDomains();
            updateStats();
            checkAllDomains();
            setupAutoRefresh();
        }

        // Filter domains by status
        function filterDomains(filter) {
            currentFilter = filter;

            // Update button styles
            document.querySelectorAll('.filter-btn').forEach(btn => {
                if (btn.dataset.filter === filter) {
                    btn.classList.add('active', 'bg-purple-500/20', 'text-purple-400', 'border-purple-500/30');
                    btn.classList.remove('bg-gray-800', 'text-gray-400', 'border-gray-700');
                } else {
                    btn.classList.remove('active', 'bg-purple-500/20', 'text-purple-400', 'border-purple-500/30');
                    btn.classList.add('bg-gray-800', 'text-gray-400', 'border-gray-700');
                }
            });

            renderDomains();
        }

        // Render domains
        function renderDomains() {
            const domainList = document.getElementById('domainList');
            domainList.innerHTML = '';

            // Filter domains based on current filter
            const filteredDomains = currentFilter === 'all'
                ? domains
                : domains.filter(d => d.status === currentFilter);

            if (filteredDomains.length === 0) {
                domainList.innerHTML = `
                    <div class="glass-effect rounded-xl p-8 text-center">
                        <i class="fas fa-search text-4xl text-gray-600 mb-4"></i>
                        <p class="text-gray-400">Tidak ada domain dengan status "${currentFilter === 'all' ? 'semua' : currentFilter}"</p>
                    </div>
                `;
                return;
            }

            filteredDomains.forEach((domain, index) => {
                const card = createDomainCard(domain);
                card.style.animationDelay = `${index * 0.1}s`;
                domainList.appendChild(card);
            });
        }
        
        // Create domain card
        function createDomainCard(domain) {
            const card = document.createElement('div');
            card.className = `glass-effect rounded-xl p-4 sm:p-6 status-card status-${domain.status} fade-in`;

            const statusIconClass = getStatusIconClass(domain.status);
            const statusBadgeClass = getStatusBadgeClass(domain.status);
            const statusText = getStatusText(domain.status);

            const responseTimeSpan = domain.responseTime > 0
                ? `<span class="whitespace-nowrap"><i class="fas fa-tachometer-alt mr-1 text-cyan-400"></i>${domain.responseTime}ms</span>`
                : '';
            const lastCheckedSpan = domain.lastChecked
                ? `<span class="whitespace-nowrap"><i class="fas fa-clock mr-1 text-yellow-400"></i>${new Date(domain.lastChecked).toLocaleTimeString('id-ID')}</span>`
                : '';

            card.innerHTML = `
                <div class="flex flex-col sm:flex-row items-start gap-3">
                    <!-- Icon -->
                    <div class="flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${statusBadgeClass}">
                        <i class="fas ${statusIconClass} text-lg sm:text-2xl"></i>
                    </div>

                    <!-- Info -->
                    <div class="flex-1 min-w-0 w-full">
                        <!-- Top row: Name + Badges -->
                        <div class="flex flex-wrap items-center gap-2 mb-2">
                            <h3 class="text-base sm:text-xl font-semibold text-white truncate max-w-[150px] sm:max-w-none">${domain.name}</h3>
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass} flex-shrink-0">
                                ${statusText}
                            </span>
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 flex-shrink-0">
                                ${domain.type}
                            </span>
                        </div>

                        <!-- Bottom row: Category + Time + Actions -->
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <!-- Category info -->
                            <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-400">
                                <span class="whitespace-nowrap"><i class="fas fa-tag mr-1 text-purple-400"></i>${domain.category}</span>
                                ${responseTimeSpan}
                                ${lastCheckedSpan}
                            </div>

                            <!-- Action buttons -->
                            <div class="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                                <button onclick="showLogModal(${domain.id})" class="icon-btn icon-btn-log" title="Check Log">
                                    <i class="fas fa-history text-xs sm:text-base"></i>
                                </button>
                                <button onclick="checkDomain(${domain.id})" class="icon-btn icon-btn-sync" title="Check Status">
                                    <i class="fas fa-sync-alt text-xs sm:text-base"></i>
                                </button>
                                <button onclick="deleteDomain(${domain.id})" class="icon-btn icon-btn-delete" title="Delete">
                                    <i class="fas fa-trash text-xs sm:text-base"></i>
                                </button>
                                <a href="https://${domain.name}" target="_blank" class="icon-btn icon-btn-open" title="Open">
                                    <i class="fas fa-external-link-alt text-xs sm:text-base"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            return card;
        }

        // Get status icon class (just the icon name, not the full HTML)
        function getStatusIconClass(status) {
            switch(status) {
                case 'online':
                    return 'fa-check-circle';
                case 'offline':
                    return 'fa-times-circle';
                case 'timeout':
                    return 'fa-clock';
                default:
                    return 'fa-spinner fa-spin';
            }
        }

        // Get status badge class
        function getStatusBadgeClass(status) {
            switch(status) {
                case 'online':
                    return 'bg-green-500/20 text-green-400 border border-green-500/30';
                case 'offline':
                    return 'bg-red-500/20 text-red-400 border border-red-500/30';
                case 'timeout':
                    return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
                default:
                    return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
            }
        }
        
        // Get status text
        function getStatusText(status) {
            switch(status) {
                case 'online':
                    return 'Online';
                case 'offline':
                    return 'Offline';
                case 'timeout':
                    return 'Timeout';
                default:
                    return 'Checking...';
            }
        }

        // Log functions
        function getDomainLogs(domainId) {
            const allLogs = JSON.parse(localStorage.getItem('domainLogs') || '{}');
            return allLogs[domainId] || [];
        }

        function addLogEntry(domainId, entry) {
            const allLogs = JSON.parse(localStorage.getItem('domainLogs') || '{}');
            if (!allLogs[domainId]) {
                allLogs[domainId] = [];
            }
            // Add new entry at the beginning
            allLogs[domainId].unshift(entry);
            // Keep only last 50 entries
            allLogs[domainId] = allLogs[domainId].slice(0, 50);
            localStorage.setItem('domainLogs', JSON.stringify(allLogs));
        }

        function clearDomainLogs(domainId) {
            const allLogs = JSON.parse(localStorage.getItem('domainLogs') || '{}');
            allLogs[domainId] = [];
            localStorage.setItem('domainLogs', JSON.stringify(allLogs));
            showLogModal(domainId); // Refresh the modal
        }

        let currentLogDomainId = null;

        function showLogModal(domainId) {
            currentLogDomainId = domainId;
            const domain = domains.find(d => d.id === domainId);
            if (!domain) return;

            document.getElementById('logDomainName').textContent = domain.name;
            renderLogEntries(domainId);
            document.getElementById('logModal').classList.remove('hidden');
        }

        function hideLogModal() {
            document.getElementById('logModal').classList.add('hidden');
            currentLogDomainId = null;
        }

        function renderLogEntries(domainId) {
            const logs = getDomainLogs(domainId);
            const logContent = document.getElementById('logContent');

            if (logs.length === 0) {
                logContent.innerHTML = `
                    <div class="text-center py-8 text-gray-400">
                        <i class="fas fa-history text-4xl mb-4 text-gray-600"></i>
                        <p>Belum ada riwayat check untuk domain ini.</p>
                        <p class="text-sm mt-2">Klik tombol check untuk memulai monitoring.</p>
                    </div>
                `;
                return;
            }

            logContent.innerHTML = logs.map((log, index) => {
                const statusClass = log.status === 'online' ? 'text-green-400' :
                                   log.status === 'offline' ? 'text-red-400' :
                                   log.status === 'timeout' ? 'text-yellow-400' : 'text-blue-400';
                const statusIcon = log.status === 'online' ? 'fa-check-circle' :
                                  log.status === 'offline' ? 'fa-times-circle' :
                                  log.status === 'timeout' ? 'fa-clock' : 'fa-spinner fa-spin';

                return `
                    <div class="log-entry p-4 mb-2 flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <div class="w-10 h-10 rounded-full flex items-center justify-center ${statusClass.replace('text-', 'bg-').replace('400', '500/20')}">
                                <i class="fas ${statusIcon} ${statusClass}"></i>
                            </div>
                            <div>
                                <div class="font-medium text-white capitalize">${log.status}</div>
                                <div class="text-sm text-gray-400">${new Date(log.timestamp).toLocaleString('id-ID')}</div>
                                ${log.error ? `<div class="text-xs text-red-400 mt-1">Error: ${log.error}</div>` : ''}
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-bold text-white">${log.responseTime}ms</div>
                            <div class="text-xs text-gray-500">Response Time</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // Check single domain
        async function checkDomain(domainId) {
            const domain = domains.find(d => d.id === domainId);
            if (!domain) return;

            // Update status to checking
            domain.status = 'checking';
            renderDomains();

            const startTime = Date.now();
            let result = { status: 'checking', responseTime: 0, error: null };

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                await fetch(`https://${domain.name}`, {
                    method: 'GET',
                    mode: 'no-cors',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                result.status = 'online';
                result.responseTime = Date.now() - startTime;
            } catch (error) {
                result.status = error.name === 'AbortError' ? 'timeout' : 'offline';
                result.responseTime = Date.now() - startTime;
                result.error = error.message;
            }

            // Update domain status
            domain.status = result.status;
            domain.responseTime = result.responseTime;
            domain.lastChecked = new Date().toISOString();

            // Save log entry
            addLogEntry(domain.id, {
                timestamp: new Date().toISOString(),
                status: result.status,
                responseTime: result.responseTime,
                error: result.error
            });

            saveDomains();
            renderDomains();
            updateStats();
        }
        
        // Check all domains
        async function checkAllDomains() {
            const checkingIndicator = document.getElementById('checkingIndicator');
            checkingIndicator.classList.remove('hidden');
            
            const promises = domains.map(domain => checkDomain(domain.id));
            await Promise.all(promises);
            
            checkingIndicator.classList.add('hidden');
            document.getElementById('lastCheck').textContent = new Date().toLocaleTimeString('id-ID');
        }
        
        // Update statistics
        function updateStats() {
            const total = domains.length;
            const online = domains.filter(d => d.status === 'online').length;
            const timeout = domains.filter(d => d.status === 'timeout').length;
            const issues = domains.filter(d => d.status === 'offline').length;

            document.getElementById('totalDomains').textContent = total;
            document.getElementById('onlineDomains').textContent = online;
            document.getElementById('timeoutDomains').textContent = timeout;
            document.getElementById('issueDomains').textContent = issues;
        }
        
        // Setup auto refresh
        function setupAutoRefresh() {
            const autoRefreshCheckbox = document.getElementById('autoRefresh');
            
            function startAutoRefresh() {
                if (autoRefreshInterval) clearInterval(autoRefreshInterval);
                autoRefreshInterval = setInterval(checkAllDomains, 60000);
            }
            
            function stopAutoRefresh() {
                if (autoRefreshInterval) {
                    clearInterval(autoRefreshInterval);
                    autoRefreshInterval = null;
                }
            }
            
            autoRefreshCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    startAutoRefresh();
                } else {
                    stopAutoRefresh();
                }
            });
            
            // Start auto refresh if checked
            if (autoRefreshCheckbox.checked) {
                startAutoRefresh();
            }
        }
        
        // Show add modal
        function showAddModal() {
            document.getElementById('addModal').classList.remove('hidden');
        }
        
        // Hide add modal
        function hideAddModal() {
            document.getElementById('addModal').classList.add('hidden');
            document.getElementById('addDomainForm').reset();
        }
        
        // Add new domain
        document.getElementById('addDomainForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('domainName').value.trim();
            const type = document.getElementById('domainType').value;
            const category = document.getElementById('domainCategory').value.trim() || 'Uncategorized';
            
            if (name) {
                const newDomain = {
                    id: Date.now(),
                    name: name.toLowerCase(),
                    type: type,
                    category: category,
                    status: 'checking',
                    responseTime: 0,
                    lastChecked: null
                };

                domains.push(newDomain);
                saveDomains();
                renderDomains();
                updateStats();
                hideAddModal();

                // Check the new domain
                setTimeout(() => checkDomain(newDomain.id), 500);
            }
        });

        // Delete domain
        function deleteDomain(domainId) {
            if (confirm('Are you sure you want to delete this domain?')) {
                // Remove domain from list
                domains = domains.filter(d => d.id !== domainId);
                // Remove logs for this domain
                const allLogs = JSON.parse(localStorage.getItem('domainLogs') || '{}');
                delete allLogs[domainId];
                localStorage.setItem('domainLogs', JSON.stringify(allLogs));
                // Save and update UI
                saveDomains();
                renderDomains();
                updateStats();
            }
        }
        
        // Refresh dashboard function
        function handleLogout() {
            // Clear all data and refresh
            localStorage.removeItem('domains');
            localStorage.removeItem('domainLogs');
            location.reload();
        }
        
        // Initialize on load
        document.addEventListener('DOMContentLoaded', initDashboard);