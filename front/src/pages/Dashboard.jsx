// src/pages/Dashboard.jsx

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
const API_URL = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  const [loading, setLoading] = useState(false);

  const [pensioners, setPensioners] = useState([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadPensioners();
  }, []);

  const loadPensioners = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
  `${API_URL}/pensioners`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      setPensioners(res.data);

    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
        "Failed to load pensioners."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredPensioners = useMemo(() => {
    return pensioners.filter((p) => {

      const keyword = search.toLowerCase();

      const matchesSearch =
        p.nameEng?.toLowerCase().includes(keyword) ||
        p.nameAmh?.toLowerCase().includes(keyword) ||
        p.pensionerId?.toLowerCase().includes(keyword) ||
        p.faydaNumber?.toLowerCase().includes(keyword);

      if (statusFilter === "verified") {
        return matchesSearch && p.verified;
      }

      if (statusFilter === "notVerified") {
        return matchesSearch && !p.verified;
      }

      return matchesSearch;
    });
  }, [pensioners, search, statusFilter]);

  const total = pensioners.length;

  const verified = pensioners.filter(
    (p) => p.verified
  ).length;

  const notVerified = total - verified;

  return (
    <>
      <Navbar />

      {loading && (
        <Loader
          fullScreen
          size="lg"
          text="Loading Dashboard..."
        />
      )}

      <div className="max-w-7xl mx-auto p-6">

        <h1 className="text-3xl font-bold text-blue-700 mb-8">
          Pensioner Dashboard
        </h1>

        {/* Statistics */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div className="bg-blue-600 text-white rounded-xl p-6 shadow">
            <h2 className="text-lg">Total Pensioners</h2>

            <p className="text-4xl font-bold mt-3">
              {total}
            </p>
          </div>

          <div className="bg-green-600 text-white rounded-xl p-6 shadow">
            <h2 className="text-lg">
              Verified Pensioners
            </h2>

            <p className="text-4xl font-bold mt-3">
              {verified}
            </p>
          </div>

          <div className="bg-red-600 text-white rounded-xl p-6 shadow">
            <h2 className="text-lg">
              Not Verified
            </h2>

            <p className="text-4xl font-bold mt-3">
              {notVerified}
            </p>
          </div>

        </div>

        {/* Search */}

        <div className="bg-white rounded-xl shadow p-6 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Search by ID, Fayda Number or Name..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="border rounded-lg p-3"
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="border rounded-lg p-3"
            >
              <option value="all">
                All Pensioners
              </option>

              <option value="verified">
                Verified
              </option>

              <option value="notVerified">
                Not Verified
              </option>
            </select>

          </div>

        </div>

        {/* Pensioners Table */}

        <div className="bg-white rounded-xl shadow overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-blue-700 text-white">

              <tr>

                <th className="px-4 py-3 text-left">
                  Pensioner ID
                </th>

                <th className="px-4 py-3 text-left">
                  Name
                </th>

                <th className="px-4 py-3 text-left">
                  Fayda Number
                </th>

                <th className="px-4 py-3 text-left">
                  Phone
                </th>

                <th className="px-4 py-3 text-left">
                  Branch
                </th>

                <th className="px-4 py-3 text-center">
                  Status
                </th>

                <th className="px-4 py-3 text-center">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredPensioners.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-10 text-gray-500"
                  >
                    No pensioners found.
                  </td>
                </tr>
              ) : (
                filteredPensioners.map((pensioner) => (
                  <tr
                    key={pensioner._id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      {pensioner.pensionerId}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold">
                        {pensioner.nameEng}
                      </div>

                      <div className="text-sm text-gray-500">
                        {pensioner.nameAmh}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {pensioner.faydaNumber}
                    </td>

                    <td className="px-4 py-3">
                      {pensioner.phone}
                    </td>

                    <td className="px-4 py-3">
                      {pensioner.poessaBranch}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {pensioner.verified ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                          Verified
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-center gap-2">

                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                          onClick={() =>
                            alert(
                              `View details for ${pensioner.nameEng}`
                            )
                          }
                        >
                          View
                        </button>

                        <button
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                          onClick={() =>
                            alert(
                              `Edit ${pensioner.nameEng}`
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                          onClick={async () => {

                            const confirmed = window.confirm(
                              `Delete ${pensioner.nameEng}?`
                            );

                            if (!confirmed) return;

                            try {

                              await axios.delete(
  `${API_URL}/pensioners/${pensioner._id}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

                              loadPensioners();

                            } catch (err) {

                              console.error(err);

                              alert(
                                err.response?.data?.message ||
                                  "Delete failed."
                              );
                            }

                          }}
                        >
                          Delete
                        </button>

                        {!pensioner.verified && (

                          <button
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                            onClick={() => {
                              window.location.href =
                                `/verify?pid=${pensioner.pensionerId}`;
                            }}
                          >
                            Verify
                          </button>

                        )}

                      </div>
                    </td>
                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

        <div className="mt-6 text-gray-600">
          Showing{" "}
          <strong>
            {filteredPensioners.length}
          </strong>{" "}
          of{" "}
          <strong>
            {pensioners.length}
          </strong>{" "}
          pensioners.
        </div>
      </div>
    </>
  );
};

export default Dashboard;



