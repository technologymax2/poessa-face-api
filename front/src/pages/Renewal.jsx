import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import { createRenewal } from "../services/api";

const Renewal = () => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    message: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.title ||
      !form.message ||
      !form.startDate ||
      !form.endDate
    ) {
      alert("All fields are required.");
      return;
    }

    if (
      new Date(form.startDate) >=
      new Date(form.endDate)
    ) {
      alert("End date must be after start date.");
      return;
    }

    try {
      setLoading(true);

      const res = await createRenewal(form);

      alert(res.data.message);

      setForm({
        title: "",
        message: "",
        startDate: "",
        endDate: "",
      });

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Unable to create renewal."
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
          text="Saving..."
        />
      )}

      <div className="max-w-3xl mx-auto p-6">

        <div className="bg-white rounded-xl shadow-lg p-8">

          <h2 className="text-3xl font-bold text-blue-700 mb-8">
            Renewal Management
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>
              <label className="font-semibold">
                Renewal Title
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="font-semibold">
                Message
              </label>

              <textarea
                rows="4"
                name="message"
                value={form.message}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">

              <div>
                <label className="font-semibold">
                  Start Date
                </label>

                <input
                  type="datetime-local"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <div>
                <label className="font-semibold">
                  End Date
                </label>

                <input
                  type="datetime-local"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3"
                />
              </div>

            </div>

            <button
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg"
            >
              Publish Renewal
            </button>

          </form>

        </div>

      </div>
    </>
  );
};

export default Renewal;
