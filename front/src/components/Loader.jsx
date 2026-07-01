import React from "react";

const Loader = ({
  text = "Please wait...",
  size = "md",
  fullScreen = false,
}) => {
  const spinnerSize = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-4",
    lg: "w-16 h-16 border-4",
  };

  // ተጠቃሚው የላከው መጠን ካልተገኘ በስተdefault 'md' መጠንን እንዲጠቀም እናደርጋለን
  const selectedSize = spinnerSize[size] || spinnerSize["md"];

  const content = (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`${selectedSize} border-blue-600 border-t-transparent rounded-full animate-spin`}
      ></div>

      <p className="mt-4 text-gray-700 font-medium text-center">
        {text}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default Loader;