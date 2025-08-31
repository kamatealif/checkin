<script>
  // Example props (you can later fetch from backend or Appwrite)
  let features = [
    {
      title: "Mark Attendance",
      desc: "Quickly record student attendance with a single click.",
      icon: "✅"
    },
    {
      title: "View Reports",
      desc: "Track daily, weekly, and monthly attendance analytics.",
      icon: "📊"
    },
    {
      title: "Manage Students",
      desc: "Easily register and manage students using PRN.",
      icon: "🧑‍🎓"
    }
  ];
</script>

<!-- Page Wrapper -->
<div class="min-h-screen bg-[#131315] text-white flex flex-col">


  <!-- Hero Section -->
  <section 
    class="relative min-h-screen flex flex-col items-center justify-center text-center px-6
           bg-[var(--color-background)] 
           [background-image:repeating-linear-gradient(-45deg,rgba(253,54,110,0.08)_0,rgba(253,54,110,0.08)_2px,transparent_2px,transparent_20px)]">
  
    <!-- Overlay Gradient -->
    <div class="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-background)]"></div>
  
    <!-- Heading with White → Primary Gradient -->
    <h2 class="text-4xl md:text-6xl font-extrabold mb-4 z-10 
               bg-gradient-to-r from-white to-[var(--color-primary)]
               bg-clip-text text-transparent">
      Smart Attendance Made Simple ✨
    </h2>
  
    <!-- Subheading -->
    <p class="text-lg md:text-xl text-gray-400 mb-8 z-10 max-w-2xl">
      An efficient way to record, manage, and track attendance in real time.
    </p>
  
    <!-- CTA Buttons -->
    <div class="flex flex-col md:flex-row gap-4 z-10">
      <a href="/auth/teachers" 
         class="bg-[var(--color-primary)] hover:opacity-90 px-8 py-3 rounded-sm font-semibold shadow-lg transition transform hover:-translate-y-1">
        Register as Teacher
      </a>
      <a href="/auth/students" 
         class="bg-transparent border-2 border-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] px-8 py-3 rounded-sm font-semibold text-[var(--color-primary)] shadow-lg transition transform hover:-translate-y-1">
        Register as Student
      </a>
    </div>
  </section>
  
  

  <!-- Features Section -->
  <section class="py-12 px-6 bg-[#1d1d21]">
    <h3 class="text-3xl font-bold text-center mb-10 text-[#fd366e]">Features</h3>
    <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {#each features as f}
        <div class="bg-[#131315] rounded-2xl p-6 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
          <div class="text-4xl mb-4">{f.icon}</div>
          <h4 class="text-xl font-semibold mb-2">{f.title}</h4>
          <p class="text-gray-400">{f.desc}</p>
        </div>
      {/each}
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-[#131315] text-gray-500 text-center py-4 border-t border-gray-800">
    © 2025 AttendEase. All rights reserved.
  </footer>
</div>
