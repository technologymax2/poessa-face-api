// src/pages/Report.jsx

import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import {
  getRenewalPeriods,
  getRenewalReport,
  getBranchSummary,
} from "../services/api";

const Report = () => {
  const [loading, setLoading] = useState(false);

  const [renewals, setRenewals] = useState([]);

  const [renewalId, setRenewalId] = useState("");

  const [branch, setBranch] = useState("");

  const [summary, setSummary] = useState(null);

  const [renewed, setRenewed] = useState([]);

  const [notRenewed, setNotRenewed] = useState([]);

  const [branchSummary, setBranchSummary] = useState([]);

  useEffect(() => {
    loadRenewals();
  }, []);

  const loadRenewals = async () => {
    try {
      const res = await getRenewalPeriods();
      setRenewals(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const generateReport = async () => {
    if (!renewalId) {
      return alert("Please select a renewal period.");
    }

    try {
      setLoading(true);

      const report = await getRenewalReport(
        renewalId,
        branch
      );

      setSummary(report.data.summary);
      setRenewed(report.data.renewed);
      setNotRenewed(report.data.notRenewed);

      const branchRes =
        await getBranchSummary(renewalId);

      setBranchSummary(branchRes.data.data);

    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to load report."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      {loading && (
        <Loader
          fullScreen
          size="lg"
          text="Loading Report..."
        />
      )}

      <div className="max-w-7xl mx-auto p-6">

        <h1 className="text-3xl font-bold mb-6 text-blue-700">
          Renewal Report
        </h1>

        <div className="bg-white shadow rounded-lg p-5 mb-6">

          <div className="grid md:grid-cols-3 gap-4">

            <select
              className="border p-3 rounded"
              value={renewalId}
              onChange={(e) =>
                setRenewalId(e.target.value)
              }
            >
              <option value="">
                Select Renewal
              </option>

              {renewals.map((r) => (
                <option
                  key={r._id}
                  value={r._id}
                >
                  {r.title}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Branch (optional)"
              className="border p-3 rounded"
              value={branch}
              onChange={(e) =>
                setBranch(e.target.value)
              }
            />

            <button
              onClick={generateReport}
              className="bg-blue-700 text-white rounded p-3"
            >
              Generate Report
            </button>

          </div>

        </div>

        {summary && (
          <>
            <div className="grid md:grid-cols-4 gap-4 mb-6">

              <div className="bg-blue-100 p-5 rounded">
                <h3>Total</h3>
                <h1 className="text-3xl font-bold">
                  {summary.total}
                </h1>
              </div>

              <div className="bg-green-100 p-5 rounded">
                <h3>Renewed</h3>
                <h1 className="text-3xl font-bold">
                  {summary.renewed}
                </h1>
              </div>

              <div className="bg-red-100 p-5 rounded">
                <h3>Not Renewed</h3>
                <h1 className="text-3xl font-bold">
                  {summary.notRenewed}
                </h1>
              </div>

              <div className="bg-yellow-100 p-5 rounded">
                <h3>Renewal %</h3>
                <h1 className="text-3xl font-bold">
                  {summary.renewedPercent}%
                </h1>
              </div>

            </div>

            <div className="grid lg:grid-cols-2 gap-6">

              <div>

                <h2 className="text-xl font-bold mb-3 text-green-700">
                  Renewed
                </h2>

                <table className="w-full border">

                  <thead className="bg-green-200">

                    <tr>

                      <th className="border p-2">
                        ID
                      </th>

                      <th className="border p-2">
                        Name
                      </th>

                      <th className="border p-2">
                        Branch
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {renewed.map((p) => (
                      <tr key={p._id}>
                        <td className="border p-2">
                          {p.pensionerId}
                        </td>
                        <td className="border p-2">
                          {p.nameEng}
                        </td>
                        <td className="border p-2">
                          {p.poessaBranch}
                        </td>
                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>

              <div>

                <h2 className="text-xl font-bold mb-3 text-red-700">
                  Not Renewed
                </h2>

                <table className="w-full border">

                  <thead className="bg-red-200">

                    <tr>

                      <th className="border p-2">
                        ID
                      </th>

                      <th className="border p-2">
                        Name
                      </th>

                      <th className="border p-2">
                        Branch
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {notRenewed.map((p) => (
                      <tr key={p._id}>
                        <td className="border p-2">
                          {p.pensionerId}
                        </td>
                        <td className="border p-2">
                          {p.nameEng}
                        </td>
                        <td className="border p-2">
                          {p.poessaBranch}
                        </td>
                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>

            </div>

            <div className="mt-8">

              <h2 className="text-2xl font-bold mb-3">
                Branch Summary
              </h2>

              <table className="w-full border">

                <thead className="bg-blue-200">

                  <tr>

                    <th className="border p-2">
                      Branch
                    </th>

                    <th className="border p-2">
                      Total
                    </th>

                    <th className="border p-2">
                      Renewed
                    </th>

                    <th className="border p-2">
                      Not Renewed
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {branchSummary.map((b) => (
                    <tr key={b.branch}>
                      <td className="border p-2">
                        {b.branch}
                      </td>
                      <td className="border p-2">
                        {b.total}
                      </td>
                      <td className="border p-2">
                        {b.renewed}
                      </td>
                      <td className="border p-2">
                        {b.notRenewed}
                      </td>
                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </>
        )}

      </div>
    </>
  );
};

export default Report;
