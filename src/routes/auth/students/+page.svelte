<script lang="ts">
    import { account, db, DB_ID, STUDENTS, tablesDB } from "$lib/appwrite/client";
    import { ID, Query } from "appwrite";
  
    let step = $state<"request" | "verify">("request");
    let firstName = $state("");
    let lastName = $state("");
    let email = $state("");
    let department = $state("");
    let prn = $state("");
    let year = $state("");
    let secret = $state("");
    let userId = $state("");
  
    let error = $state("");
    let msg = $state("");
  
    async function requestOtp() {
      error = "";
      msg = "";
      if (!firstName || !lastName || !email || !department || !prn || !year) {
        error = "Please fill in all required fields.";
        return;
      }
      try {
        const res = await account.createEmailToken(ID.unique(), email);
        userId = res.userId;
        msg = "OTP sent to " + email;
        step = "verify";
      } catch (e: any) {
        error = e.message || "Failed to send OTP";
      }
    }
  
    async function verifyOtp() {
      error = "";
      msg = "";
      try {
        try {
          await account.deleteSession("current");
        } catch {}
  
        await account.createSession(userId, secret);
        const me = await account.get();
  
        // check if student already exists
        const studentDocs = await tablesDB.listRows(DB_ID, STUDENTS, [
          Query.equal("email", email),
        ]);
  
        if (studentDocs.total === 0) {
          await tablesDB.createRow(DB_ID, STUDENTS, ID.unique(), {
            first_name: firstName,
            last_name: lastName,
            email,
            department,
            prn,
            year,
          });
        }
  
        msg = "Welcome Student! Redirecting...";
        setTimeout(() => (location.href = "/student-dashboard"), 1000);
      } catch (e: any) {
        error = e.message || "Invalid OTP";
      }
    }
  </script>
  
  <div class="min-h-screen flex items-center justify-center bg-[#131315]/50  px-4">
    <div
      class="w-full max-w-md bg-card/90 text-card-foreground rounded-2xl shadow-2xl p-8 space-y-6 backdrop-blur-lg"
    >
      {#if step === "request"}
        <div class="space-y-6">
          <h2 class="text-3xl font-extrabold text-center text-primary tracking-wide">
            Student Register
          </h2>
          
          {#if error}
            <p class="text-sm text-destructive text-center bg-destructive/10 py-2 rounded-lg">
              {error}
            </p>
          {/if}
          
          {#if msg}
            <p class="text-sm text-primary text-center bg-primary/10 py-2 rounded-lg">
              {msg}
            </p>
          {/if}
          
          <form class="space-y-4" onsubmit={requestOtp}>
            <input
              bind:value={firstName}
              placeholder="First Name"
              class="w-full px-4 py-3 rounded-xl bg-background focus:ring-2 focus:ring-primary focus:outline-none transition"
            />
            <input
              bind:value={lastName}
              placeholder="Last Name"
              class="w-full px-4 py-3 rounded-xl bg-background focus:ring-2 focus:ring-primary focus:outline-none transition"
            />
            <input
              type="email"
              bind:value={email}
              placeholder="Email"
              class="w-full px-4 py-3 rounded-xl bg-background focus:ring-2 focus:ring-primary focus:outline-none transition"
            />
            <select
              bind:value={department}
              class="w-full px-4 py-3 rounded-xl bg-background focus:ring-2 focus:ring-primary focus:outline-none transition"
            >
              <option value="" disabled selected>Select Department</option>
              <option  value="BSC">BSC</option>
              <option value="BCA">BCA</option>
              <option value="BA">BA</option>
              <option value="COMM">COMM</option>
              <option value="MCA">MCA</option>
              <option value="MSC">MSC</option>
            </select>
            <input
              bind:value={prn}
              placeholder="PRN Number"
              class="w-full px-4 py-3 rounded-xl bg-background focus:ring-2 focus:ring-primary focus:outline-none transition"
            />
            <select
              bind:value={year}
              class="w-full px-4 py-3 rounded-xl bg-background focus:ring-2 focus:ring-primary focus:outline-none transition"
            >
              <option value="" disabled selected>Select Year</option>
              <option value="FY">First Year</option>
              <option value="SY">Second Year</option>
              <option value="TY">Third Year</option>
              <option value="LY">Final Year</option>
            </select>
          
            <button
              type="submit"
              class="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 active:scale-95 transition shadow-md"
            >
              Send OTP
            </button>
          </form>
        </div>
      {:else}
        <div class="space-y-6">
          <h2 class="text-3xl font-extrabold text-center text-primary tracking-wide">
            Verify OTP
          </h2>
          
          {#if error}
            <p class="text-sm text-destructive text-center bg-destructive/10 py-2 rounded-lg">
              {error}
            </p>
          {/if}
          
          {#if msg}
            <p class="text-sm text-primary text-center bg-primary/10 py-2 rounded-lg">
              {msg}
            </p>
          {/if}
          
          <form class="space-y-4" onsubmit={verifyOtp}>
            <div class="flex justify-center gap-3">
              {#each Array(6) as _, i}
                <input
                  id={"otp-" + i}
                  maxlength="1"
                  oninput={(e) => {
                    const el = e.target as HTMLInputElement;
                    if (el.value && i < 5) document.getElementById(`otp-${i+1}`)?.focus();
                    secret += el.value;
                  }}
                  class="w-12 h-12 text-center text-lg font-bold rounded-lg bg-background focus:ring-2 focus:ring-primary focus:outline-none shadow-md"
                />
              {/each}
            </div>
            <button
              type="submit"
              class="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 active:scale-95 transition shadow-md"
            >
              Verify
            </button>
          </form>
        </div>
      {/if}
    </div>
  </div>
  