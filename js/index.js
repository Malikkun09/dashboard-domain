// --- 1. KONFIGURASI JSON DATA ---
        // Anda bisa mengubah username/password di sini
        const userDatabase = [
            {
                "username": "admin",
                "password": "admin123"
            },
            {
                "username": "user",
                "password": "user123"
            }
        ];

        // --- 2. DOM ELEMENTS ---
        const loginForm = document.getElementById('loginForm');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const togglePassword = document.getElementById('togglePassword');
        const loginBtn = document.getElementById('loginBtn');
        const btnText = loginBtn.querySelector('.btn-text');
        const btnLoader = loginBtn.querySelector('.loader');
        
        const loginView = document.getElementById('login-view');
        const dashboardView = document.getElementById('dashboard-view');
        const userDisplay = document.getElementById('user-display');
        const welcomeMsg = document.getElementById('welcome-msg');

        // --- 3. FUNGSI FITUR ---

        // Fitur Show/Hide Password
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Ubah opacity icon sebagai indikator visual
            togglePassword.style.opacity = type === 'text' ? '1' : '0.5';
        });

        // Fungsi Menampilkan Toast Error
        function showToast(message) {
            const toast = document.getElementById('toast');
            const msgSpan = document.getElementById('toast-message');
            
            msgSpan.innerText = message;
            toast.classList.add('show');

            // Hilangkan setelah 3 detik
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        // Fungsi Handle Login
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Mencegah reload halaman

            const uVal = usernameInput.value.trim();
            const pVal = passwordInput.value.trim();

            if (!uVal || !pVal) {
                showToast("Harap isi username dan password!");
                return;
            }

            // Efek Loading pada tombol
            setLoading(true);

            // Simulasi delay jaringan (agar terlihat elegan)
            setTimeout(() => {
                // Cek JSON Database
                const userFound = userDatabase.find(user => user.username === uVal && user.password === pVal);

                if (userFound) {
                    // --- LOGIN SUKSES ---
                    // Di sini kita akan pindah ke dashboard
                    transitionToDashboard(userFound.username);
                } else {
                    // --- LOGIN GAGAL ---
                    setLoading(false);
                    showToast("Username atau Password salah!");
                    
                    // Efek getar pada form
                    const card = document.querySelector('.card');
                    card.style.animation = 'shake 0.5s';
                    setTimeout(() => card.style.animation = '', 500);
                }
            }, 1500); // Delay 1.5 detik
        });

        // Fungsi Animasi Loading Tombol
        function setLoading(isLoading) {
            if (isLoading) {
                btnText.style.opacity = '0';
                btnLoader.style.display = 'block';
                loginBtn.disabled = true;
                usernameInput.disabled = true;
                passwordInput.disabled = true;
            } else {
                btnText.style.opacity = '1';
                btnLoader.style.display = 'none';
                loginBtn.disabled = false;
                usernameInput.disabled = false;
                passwordInput.disabled = false;
            }
        }

        // Fungsi Transisi ke Dashboard
        function transitionToDashboard(username) {
            // Simpan session ke localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loginTime', Date.now().toString());
            localStorage.setItem('username', username);

            // 1. Fade out Login
            loginView.style.opacity = '0';
            loginView.style.transform = 'translate(-50%, -60%)'; // Sedikit geser ke atas

            setTimeout(() => {
                // 2. Redirect ke Dashboard
                window.location.href = 'dashboard.html';
            }, 500); // Tunggu animasi fade out selesai
        }

        // Fungsi Logout (Untuk kembali ke login)
        function handleLogout() {
            // Reset Form
            loginForm.reset();
            setLoading(false);

            // Transisi balik
            dashboardView.style.display = 'none';
            loginView.style.display = 'block';
            
            // Trigger reflow
            void loginView.offsetWidth; 

            loginView.style.opacity = '1';
            loginView.style.transform = 'translate(-50%, -50%)';
        }

        // Tambahkan keyframes shake via JS (atau bisa di CSS)
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
            @keyframes shake {
                0% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                50% { transform: translateX(10px); }
                75% { transform: translateX(-10px); }
                100% { transform: translateX(0); }
            }
        `;
        document.head.appendChild(styleSheet);
