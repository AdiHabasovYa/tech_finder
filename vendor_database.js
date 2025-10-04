export const vendorSeedRecords = [
  {
    id: "aws",
    category: "cloud",
    name: "Amazon Web Services",
    focusAreas: [
      "Virtual Machine",
      "Storage",
      "Machine Learning",
      "Networking",
      "Security",
      "DevOps",
    ],
    workloads: ["Enterprise", "Growth", "Public Sector"],
    mitigates: ["scalability", "operational", "compliance"],
    strengths:
      "Global infrastructure, automation tooling, rich marketplace of partners.",
    pricingModel: "Pay-as-you-go, reserved instances",
    certifications: ["ISO 27001", "SOC 2", "FedRAMP"],
    regionalCoverage: "32 regions, 102 availability zones",
    differentiators:
      "Deep partner ecosystem with managed service providers for regulated workloads.",
  },
  {
    id: "azure",
    category: "cloud",
    name: "Microsoft Azure",
    focusAreas: [
      "Virtual Machine",
      "Storage",
      "BI",
      "Machine Learning",
      "Data Analytics",
      "Security",
    ],
    workloads: ["Enterprise", "Public Sector", "Growth", "Regulated"],
    mitigates: ["identity", "residency", "migration"],
    strengths:
      "Deep integration with Microsoft 365, hybrid cloud, built-in governance tooling.",
    pricingModel: "Consumption with hybrid benefits",
    certifications: ["ISO 27001", "SOC 1/2", "GDPR", "HIPAA"],
    regionalCoverage: "60+ regions worldwide",
    differentiators:
      "Strong hybrid story with Azure Arc and local data center connectivity.",
  },
  {
    id: "gcp",
    category: "cloud",
    name: "Google Cloud Platform",
    focusAreas: [
      "Data Analytics",
      "Machine Learning",
      "Virtual Machine",
      "DevOps",
      "Networking",
    ],
    workloads: ["Digital Native", "Growth", "Startup"],
    mitigates: ["cost", "insight", "automation"],
    strengths:
      "Industry-leading data & AI services, opinionated security defaults, sustainable infrastructure.",
    pricingModel: "Granular pay-as-you-go with committed use discounts",
    certifications: ["ISO 27001", "SOC 2", "PCI DSS"],
    regionalCoverage: "39 regions, 118 zones",
    differentiators:
      "Data analytics stack with BigQuery, Looker, and Vertex AI accelerators.",
  },
  {
    id: "ibm",
    category: "cloud",
    name: "IBM Cloud",
    focusAreas: ["Security", "Data Analytics", "Networking", "Virtual Machine"],
    workloads: ["Regulated", "Enterprise", "Public Sector"],
    mitigates: ["regulation", "sovereignty", "risk"],
    strengths:
      "Compliance-first cloud with strong data protection and mainframe connectivity.",
    pricingModel: "Subscription, reserved capacity, pay-as-you-go",
    certifications: ["FISMA", "HIPAA", "GxP"],
    regionalCoverage: "18 availability zones with EU sovereign options",
    differentiators:
      "Focus on regulated industries with financial services validated zones.",
  },
  {
    id: "do",
    category: "cloud",
    name: "DigitalOcean",
    focusAreas: ["Virtual Machine", "Storage", "DevOps", "Networking"],
    workloads: ["Startup", "SMB", "Digital Native"],
    mitigates: ["time", "cost", "simplicity"],
    strengths:
      "Simple pricing, managed databases, rapid provisioning for lean teams.",
    pricingModel: "Fixed droplets, predictable billing",
    certifications: ["SOC 2"],
    regionalCoverage: "15 data centers across 9 regions",
    differentiators:
      "Developer-friendly UX with flat-rate support plans for startups.",
  },
  {
    id: "crowdstrike",
    category: "security",
    name: "CrowdStrike Falcon",
    focusAreas: ["Endpoint", "Threat Intel", "Incident Response"],
    segments: ["Enterprise", "Growth"],
    certifications: ["FedRAMP", "SOC 2"],
    differentiators: "Cloud-native EDR with managed hunting team.",
  },
  {
    id: "wiz",
    category: "security",
    name: "Wiz",
    focusAreas: ["Cloud Posture", "Vulnerability", "Identity"],
    segments: ["Enterprise", "Digital Native"],
    certifications: ["SOC 2", "ISO 27001"],
    differentiators: "Agentless scanning across multi-cloud estates.",
  },
];

export const collectionDefinitions = {
  cloud: {
    label: "Cloud Providers",
    description:
      "Curated infrastructure partners covering compute, storage, data, and platform automation needs.",
    columns: [
      { key: "name", label: "Provider" },
      { key: "focusAreas", label: "Focus areas" },
      { key: "workloads", label: "Workload fit" },
      { key: "pricingModel", label: "Pricing" },
      { key: "certifications", label: "Certifications" },
    ],
  },
  security: {
    label: "Security Platforms",
    description:
      "Endpoint protection, vulnerability management, and cloud posture vendors ready for quick engagement.",
    columns: [
      { key: "name", label: "Vendor" },
      { key: "focusAreas", label: "Focus areas" },
      { key: "segments", label: "Segment" },
      { key: "certifications", label: "Certifications" },
    ],
  },
  support: {
    label: "Support & Service Desks",
    description:
      "Service desk and ITSM options. Add records here as you expand the catalogue.",
    columns: [
      { key: "name", label: "Vendor" },
      { key: "focusAreas", label: "Focus" },
      { key: "segments", label: "Segment" },
    ],
  },
  workos: {
    label: "Work OS & Collaboration",
    description:
      "Project operating systems and collaboration hubs. Seed with partners as you capture requirements.",
    columns: [
      { key: "name", label: "Vendor" },
      { key: "focusAreas", label: "Focus" },
      { key: "segments", label: "Segment" },
    ],
  },
};

function parseJsonField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

export function deserializeProduct(row) {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    focusAreas: parseJsonField(row.focus_areas),
    workloads: parseJsonField(row.workloads),
    mitigates: parseJsonField(row.mitigates),
    segments: parseJsonField(row.segments),
    pricingModel: row.pricing_model || "",
    certifications: parseJsonField(row.certifications),
    regionalCoverage: row.regional_coverage || "",
    differentiators: row.differentiators || "",
    strengths: row.strengths || "",
  };
}

export function vendorSupportsWorkload(vendor, workloadSize) {
  const workloads = vendor.workloads || [];

  if (workloadSize === "Regulated") {
    return workloads.includes("Regulated");
  }

  if (workloadSize === "Enterprise") {
    return (
      workloads.includes("Enterprise") ||
      workloads.includes("Growth") ||
      workloads.includes("Public Sector")
    );
  }

  if (workloadSize === "Startup") {
    return (
      workloads.includes("Startup") ||
      workloads.includes("Digital Native") ||
      workloads.includes("SMB")
    );
  }

  if (workloadSize === "Digital Native") {
    return (
      workloads.includes("Digital Native") || workloads.includes("Growth")
    );
  }

  if (workloadSize === "Public Sector") {
    return (
      workloads.includes("Public Sector") ||
      workloads.includes("Enterprise") ||
      workloads.includes("Regulated") ||
      workloads.includes("Government") ||
      workloads.includes("Public")
    );
  }

  return workloads.includes(workloadSize);
}

export function computeCloudMatchScore(vendor, { need, workloadSize, budget, weakPoints }) {
  if (!vendor.focusAreas.includes(need)) {
    return null;
  }

  if (!vendorSupportsWorkload(vendor, workloadSize)) {
    return null;
  }

  const normalizedWeakPoints = (weakPoints || "").toLowerCase();
  const budgetBoost = budget === "High" ? 5 : budget === "Medium" ? 3 : 0;
  const workloadFit = vendor.workloads.includes(workloadSize) ? 25 : 15;
  const mitigationMatches = vendor.mitigates.filter((item) =>
    normalizedWeakPoints.includes(item)
  );
  const mitigationScore = mitigationMatches.length > 0 ? 10 : 0;
  const certificationBonus =
    workloadSize === "Regulated" && vendor.certifications.length > 0 ? 8 : 0;

  return {
    ...vendor,
    matchScore: Math.min(
      100,
      55 + workloadFit + mitigationScore + budgetBoost + certificationBonus
    ),
    highlightedMitigations: mitigationMatches,
  };
}
