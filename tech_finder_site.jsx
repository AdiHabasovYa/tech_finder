import React, { useMemo, useState } from "react";
import { HashRouter as Router, Route, Routes, Link } from "react-router-dom";

const cloudVendors = [
  {
    name: "Amazon Web Services",
    focusAreas: [
      "Virtual Machine",
      "Storage",
      "Machine Learning",
      "Networking",
      "Security",
      "DevOps",
    ],
    workloads: ["Enterprise", "Growth"],
    strengths:
      "Global infrastructure, automation tooling, rich marketplace of partners.",
    mitigates: ["scalability", "operational gaps", "compliance"],
  },
  {
    name: "Microsoft Azure",
    focusAreas: [
      "Virtual Machine",
      "Storage",
      "BI",
      "Machine Learning",
      "Data Analytics",
      "Security",
    ],
    workloads: ["Enterprise", "Public Sector", "Growth"],
    strengths:
      "Deep integration with Microsoft 365, hybrid cloud, built-in governance tooling.",
    mitigates: ["identity gaps", "data residency", "legacy migration"],
  },
  {
    name: "Google Cloud Platform",
    focusAreas: [
      "Data Analytics",
      "Machine Learning",
      "Virtual Machine",
      "DevOps",
      "Networking",
    ],
    workloads: ["Digital Native", "Growth"],
    strengths:
      "Industry-leading data & AI services, opinionated security defaults, sustainable infrastructure.",
    mitigates: ["cost efficiency", "insight gaps", "automation"],
  },
  {
    name: "IBM Cloud",
    focusAreas: ["Security", "Data Analytics", "Networking", "Virtual Machine"],
    workloads: ["Regulated", "Enterprise"],
    strengths:
      "Compliance-first cloud with strong data protection and mainframe connectivity.",
    mitigates: ["regulation", "sovereignty", "risk"],
  },
  {
    name: "DigitalOcean",
    focusAreas: ["Virtual Machine", "Storage", "DevOps", "Networking"],
    workloads: ["Startup", "SMB"],
    strengths:
      "Simple pricing, managed databases, rapid provisioning for lean teams.",
    mitigates: ["time to market", "cost visibility"],
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-blue-300 flex flex-col items-center justify-center">
      <img src="/logo.png" alt="Logo" className="w-20 h-20 mb-4" />
      <h1 className="text-4xl font-bold text-blue-900 mb-4">Tech-Finder</h1>
      <p className="text-lg text-indigo-900 mb-6 max-w-xl text-center">
        Match your organization’s technology challenges with recommended
        suppliers across cloud, security, databases, and operations. Start by
        choosing the area that interests you.
      </p>
      <input
        type="text"
        placeholder="Choose your Software"
        className="text-center py-2 px-4 rounded-md shadow mb-6 w-96"
      />
      <div className="flex gap-8 text-xl text-teal-700">
        <Link to="/cloud">Cloud</Link>
        <Link to="/security">Security</Link>
        <Link to="/db">DB</Link>
        <Link to="/support">Support</Link>
        <Link to="/workos">Work OS</Link>
      </div>
    </div>
  );
}

function CloudStep1() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-blue-300 flex flex-col items-center justify-center">
      <h2 className="text-5xl text-teal-800 mb-4">Cloud</h2>
      <div className="text-lg text-indigo-900 mb-4">Business needs?</div>
      <div className="flex flex-wrap justify-center gap-4">
        {['Production', 'Development', 'Data Analyst', 'Testing'].map(item => (
          <Link to="/cloud/step2" key={item} className="border px-6 py-2 rounded-md text-teal-700 hover:bg-teal-100">
            {item}
          </Link>
        ))}
      </div>
    </div>
  );
}

function CloudStep2() {
  const [selectedNeed, setSelectedNeed] = useState("Virtual Machine");
  const [workloadSize, setWorkloadSize] = useState("Growth");
  const [budget, setBudget] = useState("Medium");
  const [weakPoints, setWeakPoints] = useState("");
  const [notes, setNotes] = useState("");
  const [showResults, setShowResults] = useState(false);

  const recommendations = useMemo(() => {
    const normalizedWeakPoints = weakPoints.toLowerCase();
    return cloudVendors
      .filter((vendor) => vendor.focusAreas.includes(selectedNeed))
      .filter((vendor) => {
        if (workloadSize === "Regulated") {
          return vendor.workloads.includes("Regulated");
        }
        if (workloadSize === "Enterprise") {
          return vendor.workloads.includes("Enterprise") || vendor.workloads.includes("Growth");
        }
        if (workloadSize === "Startup") {
          return vendor.workloads.includes("Startup") || vendor.workloads.includes("Digital Native") || vendor.workloads.includes("SMB");
        }
        if (workloadSize === "Digital Native") {
          return vendor.workloads.includes("Digital Native") || vendor.workloads.includes("Growth");
        }
        return vendor.workloads.includes(workloadSize);
      })
      .map((vendor) => {
        const mitigations = vendor.mitigates.filter((item) =>
          normalizedWeakPoints.includes(item.split(" ")[0])
        );
        return {
          ...vendor,
          matchScore:
            60 +
            (vendor.workloads.includes(workloadSize) ? 20 : 10) +
            (mitigations.length > 0 ? 10 : 0) +
            (budget === "High" ? 5 : 0),
          highlightedMitigations: mitigations,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [selectedNeed, workloadSize, budget, weakPoints]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setShowResults(true);
  };

  const needs = [
    "Virtual Machine",
    "Storage",
    "Data Analytics",
    "BI",
    "Machine Learning",
    "Networking",
    "Security",
    "DevOps",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-blue-300 flex flex-col items-center py-12">
      <h2 className="text-5xl text-teal-800 mb-2">Cloud</h2>
      <div className="text-lg text-indigo-900 mb-6">
        Choose the technology need and outline your organization’s profile to
        receive tailored vendor matches.
      </div>
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {needs.map((item) => (
          <button
            key={item}
            className={`border px-5 py-2 rounded-md transition-colors ${
              selectedNeed === item
                ? "bg-teal-600 text-white border-teal-700"
                : "text-teal-700 hover:bg-teal-100"
            }`}
            onClick={() => {
              setSelectedNeed(item);
              setShowResults(false);
            }}
          >
            {item}
          </button>
        ))}
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur rounded-xl shadow-lg px-8 py-6 max-w-3xl w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex flex-col text-sm text-indigo-900">
            Workload profile
            <select
              className="mt-1 rounded-md border border-slate-300 px-3 py-2"
              value={workloadSize}
              onChange={(event) => {
                setWorkloadSize(event.target.value);
                setShowResults(false);
              }}
            >
              <option value="Startup">Startup / SMB</option>
              <option value="Growth">Growth</option>
              <option value="Digital Native">Digital Native</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Regulated">Highly Regulated</option>
              <option value="Public Sector">Public Sector</option>
            </select>
          </label>
          <label className="flex flex-col text-sm text-indigo-900">
            Budget expectation
            <select
              className="mt-1 rounded-md border border-slate-300 px-3 py-2"
              value={budget}
              onChange={(event) => {
                setBudget(event.target.value);
                setShowResults(false);
              }}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>
          <label className="flex flex-col text-sm text-indigo-900 md:col-span-2">
            Primary weak points (for example: cyber threats, cost, business
            continuity)
            <textarea
              className="mt-1 rounded-md border border-slate-300 px-3 py-2"
              rows={3}
              value={weakPoints}
              onChange={(event) => {
                setWeakPoints(event.target.value);
                setShowResults(false);
              }}
            />
          </label>
          <label className="flex flex-col text-sm text-indigo-900 md:col-span-2">
            Additional notes (such as workload volumes, timelines, DevOps
            requirements)
            <textarea
              className="mt-1 rounded-md border border-slate-300 px-3 py-2"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="bg-teal-600 text-white px-6 py-2 rounded-md shadow hover:bg-teal-700"
          >
            Get matches
          </button>
        </div>
      </form>
      {showResults && (
        <div className="mt-10 w-full max-w-4xl">
          <h3 className="text-2xl text-teal-800 mb-4">Recommended vendors</h3>
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="bg-white/70 border border-dashed border-teal-300 rounded-lg px-6 py-8 text-center text-indigo-900">
                No matching vendors were found. Try adjusting your needs or reach out to a specialist.
              </div>
            ) : (
              recommendations.map((vendor) => (
                <div
                  key={vendor.name}
                  className="bg-white/80 backdrop-blur border border-teal-200 rounded-lg px-6 py-4 shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-xl font-semibold text-teal-800">
                        {vendor.name}
                      </h4>
                      <p className="text-sm text-indigo-900 mt-1">
                        Strength areas: {vendor.focusAreas.join(", ")}
                      </p>
                    </div>
                    <div className="mt-3 md:mt-0 text-sm text-teal-700 font-medium">
                      Match score: {vendor.matchScore}%
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 mt-3">
                    {vendor.strengths}
                  </p>
                  {vendor.highlightedMitigations.length > 0 && (
                    <p className="text-sm text-emerald-700 mt-2">
                      Especially addresses: {vendor.highlightedMitigations.join(", ")}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cloud" element={<CloudStep1 />} />
        <Route path="/cloud/step2" element={<CloudStep2 />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}
