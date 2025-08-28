<script>
    let isOpen = $state(false);
  </script>
  
  <nav class="bg-[var(--color-surface)] text-white shadow-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        
        <!-- Logo -->
        <div class="flex-shrink-0">
          <a href="/" class="text-2xl font-bold text-[var(--color-primary)]">AttendEase</a>
        </div>
  
        <!-- Desktop Menu -->
        <div class="hidden md:flex space-x-8">
          <a href="/" class="hover:text-[var(--color-primary)] transition">Home</a>
          <a href="/students" class="hover:text-[var(--color-primary)] transition">Students</a>
          <a href="/reports" class="hover:text-[var(--color-primary)] transition">Reports</a>
          <a href="/login" class="hover:text-[var(--color-primary)] transition">Login</a>
        </div>
  
        <!-- Mobile Hamburger -->
        <div class="md:hidden">
          <button 
            class="focus:outline-none p-2 rounded-md hover:bg-[var(--color-background)] transition"
            onclick={() => isOpen = !isOpen}>
            {#if isOpen}
              <!-- X Icon -->
              <svg class="w-7 h-7 text-[var(--color-primary)]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            {:else}
              <!-- Hamburger Icon -->
              <svg class="w-7 h-7 text-[var(--color-primary)]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            {/if}
          </button>
        </div>
      </div>
    </div>
  
    <!-- Mobile Menu (Overlay) -->
    {#if isOpen}
      <div 
        class="absolute top-16 left-0 w-full md:hidden bg-[var(--color-background)] z-50 shadow-lg 
               animate-slideDown">
        <div class="px-6 py-6 space-y-4">
          <a href="/" class="block px-4 py-3 rounded-lg text-lg font-medium hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)] transition">
            Home
          </a>
          <a href="/students" class="block px-4 py-3 rounded-lg text-lg font-medium hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)] transition">
            Students
          </a>
          <a href="/reports" class="block px-4 py-3 rounded-lg text-lg font-medium hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)] transition">
            Reports
          </a>
          <a href="/login" class="block px-4 py-3 rounded-lg text-lg font-medium hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)] transition">
            Login
          </a>
        </div>
      </div>
    {/if}
  </nav>
  
  <style>
    /* Small slide-down animation */
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slideDown {
      animation: slideDown 0.25s ease-out;
    }
  </style>
  