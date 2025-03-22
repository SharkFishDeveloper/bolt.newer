const Loader = () => {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex space-x-2">
          <div className="w-4 h-4 bg-white rounded-full animate-bounce [animation-delay:0s]"></div>
          <div className="w-4 h-4 bg-white rounded-full animate-bounce [animation-delay:0.15s]"></div>
          <div className="w-4 h-4 bg-white rounded-full animate-bounce [animation-delay:0.3s]"></div>
        </div>
      </div>
    );
  };
  
  export default Loader;
  