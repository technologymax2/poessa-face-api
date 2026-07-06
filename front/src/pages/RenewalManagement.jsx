import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import {
  createRenewal,
  getCurrentRenewal,
} from "../services/api";

const RenewalManagement = () => {
  const [loading, setLoading] = useState(false);

  const [current, setCurrent] = useState(null);

  const [form, setForm] = useState({
    title: "",
    message: "",
    startDate: "",
    endDate: "",
  });

  const loadCurrent = async () => {
    try {
      const res = await getCurrentRenewal();

      if (res.data.success) {
        setCurrent(res.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadCurrent();
  }, []);
const updateRenewal = async (req, res) => {
  try {
    const renewal = await Renewal.findById(req.params.id);

    if (!renewal) {
      return res.status(404).json({
        success: false,
        message: "Renewal not found.",
      });
    }


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
      alert("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      await createRenewal(form);

      alert("Renewal created successfully.");

      setForm({
        title: "",
        message: "",
        startDate: "",
        endDate: "",
      });

      loadCurrent();
    } catch (err) {
      console.log(err);

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

      <div className="max-w-4xl mx-auto p-6">

        <div className="bg-white rounded-xl shadow-lg p-6">

          <h2 className="text-3xl font-bold text-blue-700 mb-6">
            Renewal Management
          </h2>

          {current && (
            <div className="mb-8 p-5 rounded-lg bg-blue-50 border">

              <h3 className="font-bold text-xl mb-2">
                Current Renewal
              </h3>

              <p>
                <strong>Title:</strong>{" "}
                {current.title}
              </p>

              <p>
                <strong>Message:</strong>{" "}
                {current.message}
              </p>

              <p>
                <strong>Start:</strong>{" "}
                {new Date(
                  current.startDate
                ).toLocaleString()}
              </p>

              <p>
                <strong>End:</strong>{" "}
                {new Date(
                  current.endDate
                ).toLocaleString()}
              </p>

            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>

              <label className="block mb-2 font-semibold">
                Title
              </label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
                placeholder="Example: July 2026 Renewal"
              />

            </div>

            <div>

              <label className="block mb-2 font-semibold">
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

                <label className="block mb-2 font-semibold">
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

                <label className="block mb-2 font-semibold">
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

export default RenewalManagement;
