export const cloudVendorRecords = [
  {
    id: "aws",
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
];

const securityVendors = [
  {
    id: "crowdstrike",
    name: "CrowdStrike Falcon",
    focusAreas: ["Endpoint", "Threat Intel", "Incident Response"],
    segments: ["Enterprise", "Growth"],
    certifications: ["FedRAMP", "SOC 2"],
    differentiators: "Cloud-native EDR with managed hunting team.",
  },
  {
    id: "wiz",
    name: "Wiz",
    focusAreas: ["Cloud Posture", "Vulnerability", "Identity"],
    segments: ["Enterprise", "Digital Native"],
    certifications: ["SOC 2", "ISO 27001"],
    differentiators: "Agentless scanning across multi-cloud estates.",
  },
];

export const vendorCollections = {
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
    rows: cloudVendorRecords,
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
    rows: securityVendors,
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
    rows: [],
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
    rows: [],
  },
};

export function queryCloudVendors({
  need,
  workloadSize,
  budget,
  weakPoints,
}) {
  const normalizedWeakPoints = (weakPoints || "").toLowerCase();
  const budgetBoost = budget === "High" ? 5 : budget === "Medium" ? 3 : 0;

  const scored = cloudVendorRecords
    .filter((vendor) => vendor.focusAreas.includes(need))
    .filter((vendor) => {
      if (workloadSize === "Regulated") {
        return vendor.workloads?.includes("Regulated");
      }
      if (workloadSize === "Enterprise") {
        return (
          vendor.workloads?.includes("Enterprise") ||
          vendor.workloads?.includes("Growth") ||
          vendor.workloads?.includes("Public Sector")
        );
      }
      if (workloadSize === "Startup") {
        return (
          vendor.workloads?.includes("Startup") ||
          vendor.workloads?.includes("Digital Native") ||
          vendor.workloads?.includes("SMB")
        );
      }
      if (workloadSize === "Digital Native") {
        return (
          vendor.workloads?.includes("Digital Native") ||
          vendor.workloads?.includes("Growth")
        );
      }
      if (workloadSize === "Public Sector") {
        return (
          vendor.workloads?.includes("Public Sector") ||
          vendor.certifications?.includes("FedRAMP")
        );
      }
      return vendor.workloads?.includes(workloadSize);
    })
    .map((vendor) => {
      const mitigationMatches = vendor.mitigates?.filter((item) =>
        normalizedWeakPoints.includes(item)
      );
      const workloadFit = vendor.workloads?.includes(workloadSize) ? 25 : 15;
      const mitigationScore = mitigationMatches && mitigationMatches.length > 0 ? 10 : 0;
      const certificationBonus =
        workloadSize === "Regulated" && vendor.certifications?.length
          ? 8
          : 0;

      return {
        ...vendor,
        matchScore: 55 + workloadFit + mitigationScore + budgetBoost + certificationBonus,
        highlightedMitigations: mitigationMatches || [],
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return new Promise((resolve) => {
    setTimeout(() => resolve(scored), 200);
  });
}

