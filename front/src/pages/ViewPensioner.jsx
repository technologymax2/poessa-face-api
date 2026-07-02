// src/pages/ViewPensioner.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import { getPensioner } from "../services/api";

const API_URL = process.env.REACT_APP_API_URL?.replace("/api", "");

const ViewPensioner = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [pensioner, setPensioner] = useState(null);

  useEffect(() => {
    loadPensioner();
    // eslint-disable-next-line
  }, []);

  const loadPensioner = async () => {
    try {
      setLoading(true);

      const res = await getPensioner(id);

      setPensioner(res.data.data);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Unable to load pensioner.");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Loader
          fullScreen
          size="lg"
          text="Loading Pensioner..."
        />
      </>
    );
  }

  if (!pensioner) {
    return (
      <>
        <Navbar />
        <div className="text-center mt-20">
          Pensioner not found.
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">

        <div className="bg-white rounded-xl shadow-lg p-8">

          <div className="flex justify-between items-center mb-8">

            <h2 className="text-3xl font-bold text-blue-700">
              Pensioner Details
            </h2>

            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg"
            >
              Back
            </button>

          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {/* Image */}

            <div>

              <img
                src={`${API_URL}${pensioner.image}`}
                alt={pensioner.nameEng}
                className="w-full rounded-xl border shadow"
              />

            </div>

            {/* Details */}

            <div className="md:col-span-2">

              <div className="grid grid-cols-2 gap-5">

                <Info
                  label="Pensioner ID"
                  value={pensioner.pensionerId}
                />

                <Info
                  label="Fayda Number"
                  value={pensioner.faydaNumber}
                />

                <Info
                  label="English Name"
                  value={pensioner.nameEng}
                />

                <Info
                  label="Amharic Name"
                  value={pensioner.nameAmh}
                />

                <Info
                  label="TIN"
                  value={pensioner.tin}
                />

                <Info
                  label="Phone"
                  value={pensioner.phone}
                />

                <Info
                  label="Age"
                  value={pensioner.age}
                />

                <Info
                  label="Gender"
                  value={pensioner.gender}
                />

                <Info
                  label="POESSA Branch"
                  value={pensioner.poessaBranch}
                />

                <Info
                  label="Bank Name (English)"
                  value={pensioner.bankNameEng}
                />

                <Info
                  label="Bank Name (Amharic)"
                  value={pensioner.bankNameAmh}
                />

                <Info
                  label="Bank Branch"
                  value={pensioner.bankBranch}
                />

                <Info
                  label="Pension Amount"
                  value={pensioner.pensionAmount}
                />

                <Info
                  label="Issue Date"
                  value={
                    pensioner.issueDate
                      ? pensioner.issueDate.substring(0, 10)
                      : ""
                  }
                />

                <Info
                  label="Expiry Date"
                  value={
                    pensioner.expiryDate
                      ? pensioner.expiryDate.substring(0, 10)
                      : ""
                  }
                />

                <Info
                  label="Verified"
                  value={
                    pensioner.verified
                      ? "Yes"
                      : "No"
                  }
                />

              </div>

              <div className="mt-6">

                <label className="font-semibold">
                  Address (English)
                </label>

                <div className="border rounded-lg p-3 bg-gray-50">
                  {pensioner.addressEng}
                </div>

              </div>

              <div className="mt-4">

                <label className="font-semibold">
                  Address (Amharic)
                </label>

                <div className="border rounded-lg p-3 bg-gray-50">
                  {pensioner.addressAmh}
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </>
  );
};

const Info = ({ label, value }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-600 mb-1">
      {label}
    </label>

    <div className="border rounded-lg p-3 bg-gray-50">
      {value || "-"}
    </div>
  </div>
);

export default ViewPensioner;