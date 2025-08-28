<!-- student register page -->

<script lang="ts">
    import { account, db } from "$lib/appwrite";
    import { Query } from "appwrite";
    import { prnToEmail } from "$lib/auth/personregno";
  
    let prn = "", password = "", loading = false, error = "";
  
    async function onSubmit() {
      loading = true; error = "";
      try {
        // Optional: verify PRN exists in profiles first for better error messages
        const profiles = await db.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_COL_PROFILES,
          [Query.equal("prn", prn)]
        );
        if (profiles.total === 0) throw new Error("PRN not found");
  
        const email = prnToEmail(prn);
        await account.createEmailSession(email, password);
  
        // route by role
        const role = profiles.documents[0].role;
        location.href = role === "teacher" ? "/teacher/dashboard" : "/student";
      } catch (e:any) {
        error = e?.message ?? "Login failed";
      } finally { loading = false; }
    }
  </script>
  
  <form class="max-w-sm mx-auto space-y-3" on:submit|preventDefault={onSubmit}>
    <h1 class="text-xl font-semibold">Login</h1>
    {#if error}<p class="text-sm text-red-600">{error}</p>{/if}
    <input class="input" placeholder="PRN" bind:value={prn} required />
    <input class="input" type="password" placeholder="Password" bind:value={password} required />
    <button class="btn" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
  </form>
  