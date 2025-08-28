export function prnToEmail(prn: string) {
    return `${prn.toLowerCase()}@students.local`;
  }
  export function isValidPRN(prn: string) {
    // adjust to your college’s PRN pattern
    return /^[a-z0-9-]{6,20}$/i.test(prn);
  }
  