let d="";
process.stdin.on("data", c => d += c);
process.stdin.on("end", () => {
  const a = JSON.parse(d);
  const v = a.vulnerabilities || {};
  for (const [k, m] of Object.entries(v)) {
    const via = (m.via || []).filter(x => typeof x === "string").join(", ").slice(0, 60);
    const fix = m.fixAvailable === false ? "NONE" : (m.fixAvailable && m.fixAvailable.name ? m.fixAvailable.name + "@" + m.fixAvailable.version : "yes");
    console.log(m.severity.toUpperCase().padEnd(9), k.padEnd(22), "| direct:", m.isDirect, "| via:", via, "| fix:", fix);
  }
  console.log("\nTOTAL:", JSON.stringify(a.metadata.vulnerabilities));
});
