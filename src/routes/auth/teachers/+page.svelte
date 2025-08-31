<script lang="ts">
  import { account, db, DB_ID, TEACHERS, tablesDB } from "$lib/appwrite/client";
  import { ID, Query } from "appwrite";

  let step = $state<"request" | "verify">("request");
  let firstName = $state("");
  let lastName = $state("");
  let email = $state("");
  let department = $state("");
  let userId = $state("");

  // OTP handling
  let otp: string[] = ["", "", "", "", "", ""];
  let error = $state("");
  let msg = $state("");

  async function requestOtp() {
    error = "";
    msg = "";
    if (!firstName || !lastName || !email || !department) {
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

  function handleInput(e: Event, index: number) {
    const input = e.target as HTMLInputElement;
    otp[index] = input.value.replace(/[^0-9]/g, "");
    if (otp[index] && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  }

  function handleKeyDown(e: KeyboardEvent, index: number) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  }

  async function verifyOtp() {
    error = "";
    msg = "";
    const secret = otp.join("");
    if (secret.length !== otp.length) {
      error = "Please enter the full OTP.";
      return;
    }

    try {
      try {
        await account.deleteSession("current");
      } catch {}

      await account.createSession(userId, secret);
      const me = await account.get();

      const teacherDocs = await tablesDB.listRows(DB_ID, TEACHERS, [
        Query.equal("email", email),
      ]);

      if (teacherDocs.total === 0) {
        await tablesDB.createRow(DB_ID, TEACHERS, ID.unique(), {
          first_name: firstName,
          last_name: lastName,
          email,
          department,
        });
      }

      msg = "Welcome Teacher! Redirecting...";
      setTimeout(() => (location.href = "/create-class"), 1000);
    } catch (e: any) {
      error = e.message || "Invalid OTP";
    }
  }
</script>

<div
  class="relative min-h-screen flex flex-col items-center justify-center text-center px-6
         bg-[var(--color-background)] 
         [background-image:repeating-linear-gradient(-45deg,rgba(253,54,110,0.08)_0,rgba(253,54,110,0.08)_2px,transparent_2px,transparent_20px)]"
>
  <div
    class="w-full max-w-md bg-card/50 text-card-foreground rounded-2xl shadow-2xl p-8 space-y-6 backdrop-blur-lg"
  >
    {#if step === "request"}
      <div class="space-y-6">
        <h2 class="text-3xl font-extrabold text-center text-primary tracking-wide">
          Teacher Register
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
            class="w-full px-4 py-3 rounded-xl bg-surface focus:ring-2 focus:ring-primary focus:outline-none transition"
          />
          <input
            bind:value={lastName}
            placeholder="Last Name"
            class="w-full px-4 py-3 rounded-xl bg-surface focus:ring-2 focus:ring-primary focus:outline-none transition"
          />
          <input
            type="email"
            bind:value={email}
            placeholder="Email"
            class="w-full px-4 py-3 rounded-xl bg-surface focus:ring-2 focus:ring-primary focus:outline-none transition"
          />
          <select
            bind:value={department}
            class="w-full px-4 py-3 rounded-xl bg-surface focus:ring-2 focus:ring-primary focus:outline-none transition"
          >
            <option value="" disabled selected>Select Department</option>
            <option value="BSC">BSC</option>
            <option value="BCA">BCA</option>
            <option value="BA">BA</option>
            <option value="COMM">COMM</option>
            <option value="MCA">MCA</option>
            <option value="MSC">MSC</option>
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
            {#each otp as digit, i}
              <input
                id={"otp-" + i}
                bind:value={otp[i]}
                maxlength="1"
                oninput={(e) => handleInput(e, i)}
                onkeydown={(e) => handleKeyDown(e, i)}
                class="w-12 h-12 text-center text-lg font-bold rounded-lg bg-surface focus:ring-2 focus:ring-primary focus:outline-none shadow-md"
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
