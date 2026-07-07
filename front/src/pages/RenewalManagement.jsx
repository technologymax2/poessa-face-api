import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import {
  createRenewal,
  getCurrentRenewal,
  updateRenewal,
  deleteRenewal,
} from "../services/api";

const RenewalManagement = () => {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [renewals, setRenewals] = useState([]);

  const [form, setForm] = useState({
    title: "",
    message: "",
    startDate: "",
    endDate: "",
  });

 const loadRenewals = async () => {
  try {
    const res = await getRenewals();

    setRenewals(res.data.data);
  } catch (err) {
    console.log(err);
  }
};

useEffect(() => {
  loadRenewals();
}, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this renewal?")) return;

    try {
      setLoading(true);

      await deleteRenewal(current._id);

      alert("Renewal deleted.");

      setCurrent(null);
      setEditing(false);

      setForm({
        title: "",
        message: "",
        startDate: "",
        endDate: "",
      });

      await loadCurrent();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    } finally {
      setLoading(false);
    }
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

      if (editing) {
        await updateRenewal(current._id, form);
        alert("Renewal updated successfully.");
      } else {
        await createRenewal(form);
        alert("Renewal created successfully.");
      }

      setEditing(false);

      setForm({
        title: "",
        message: "",
        startDate: "",
        endDate: "",
      });

      await loadCurrent();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed.");
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

        {renewals.map((item) => (
  <div
    key={item._id}
    className="border rounded-lg p-5 mb-5 bg-blue-50"
  >
    <h3 className="font-bold text-xl">
      {item.title}
    </h3>

    <p>{item.message}</p>

    <p>
      <strong>Start:</strong>{" "}
      {new Date(item.startDate).toLocaleString()}
    </p>

    <p>
      <strong>End:</strong>{" "}
      {new Date(item.endDate).toLocaleString()}
    </p>

    <div className="flex gap-3 mt-4">
      <button
        className="bg-yellow-500 text-white px-4 py-2 rounded"
        onClick={() => {
          setEditing(true);

          setCurrent(item);

          setForm({
            title: item.title,
            message: item.message,
            startDate: new Date(item.startDate)
              .toISOString()
              .slice(0,16),
            endDate: new Date(item.endDate)
              .toISOString()
              .slice(0,16),
          });
        }}
      >
        Edit
      </button>

      <button
        className="bg-red-600 text-white px-4 py-2 rounded"
        onClick={() => handleDelete(item._id)}
      >
        Delete
      </button>
    </div>
  </div>
))}

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
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg disabled:bg-gray-400"
            >
              {editing ? "Update Renewal" : "Publish Renewal"}
            </button>

          </form>

        </div>
      </div>
    </>
  );
};

export default RenewalManagement;
