<script>
    import { fade, slide } from "svelte/transition";
  
    let activeTab = $state("teacher"); // "teacher" | "student"
  </script>
  
  <section class="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
    <div class="w-full max-w-md bg-[var(--color-surface)] rounded-2xl shadow-xl p-8 relative overflow-hidden">
      
      <!-- Heading -->
      <h2 class="text-3xl font-extrabold text-center mb-6
                 bg-gradient-to-r from-white to-[var(--color-primary)] bg-clip-text text-transparent">
        Login
      </h2>
  
      <!-- Toggle Tabs -->
      <div class="flex mb-6 bg-[var(--color-background)] rounded-xl p-1">
        <button 
          class="flex-1 py-2 rounded-lg font-medium transition
                 {activeTab === 'teacher' 
                   ? 'bg-[var(--color-primary)] text-white' 
                   : 'text-gray-400 hover:text-white'}"
          onclick={() => activeTab = 'teacher'}>
          Teacher
        </button>
        <button 
          class="flex-1 py-2 rounded-lg font-medium transition
                 {activeTab === 'student' 
                   ? 'bg-[var(--color-primary)] text-white' 
                   : 'text-gray-400 hover:text-white'}"
          onclick={() => activeTab = 'student'}>
          Student
        </button>
      </div>
  
      <!-- Teacher Form -->
      {#if activeTab === 'teacher'}
        <form class="space-y-4" transition:slide={{ duration: 250, "axis": "y" }}>
          <div>
            <label for="email" class="block text-sm font-medium mb-1">Email</label>
            <input id="email" type="email" placeholder="teacher@example.com"
              class="w-full px-4 py-3 rounded-lg bg-[var(--color-background)] border border-gray-700 
                     focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] outline-none"/>
          </div>
          <div>
            <label for="password" class="block text-sm font-medium mb-1">Password</label>
            <input id="password" type="password" placeholder="••••••••"
              class="w-full px-4 py-3 rounded-lg bg-[var(--color-background)] border border-gray-700 
                     focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] outline-none"/>
          </div>
        
          <button 
            type="submit"
            class="w-full py-3 rounded-lg bg-[var(--color-primary)] hover:opacity-90 transition font-semibold">
            Login as Teacher
          </button>
        </form>
      {:else}
        <!-- Student Form -->
        <form class="space-y-4" transition:slide={{ duration: 250, "axis": "y"}}>
        
          
          <div>
            <label for="prn" class="block text-sm font-medium mb-1">PRN (Permanent Registration Number)</label>
            <input id="prn" type="text" placeholder="Enter PRN"
              class="w-full px-4 py-3 rounded-lg bg-[var(--color-background)] border border-gray-700 
                     focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] outline-none"/>
          </div>
          <div>
            <label for="password" class="block text-sm font-medium mb-1">Password</label>
            <input id="password" type="password" placeholder="••••••••"
              class="w-full px-4 py-3 rounded-lg bg-[var(--color-background)] border border-gray-700 
                     focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] outline-none"/>
          </div>
          <button 
            type="submit"
            class="w-full py-3 rounded-lg bg-[var(--color-primary)] hover:opacity-90 transition font-semibold">
            Login as Student
          </button>
        </form>
      {/if}
    </div>
  </section>
  