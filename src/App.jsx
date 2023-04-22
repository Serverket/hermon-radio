import React from "react";
import "./styles/tailwind.css";

function App() {
  const [darkToggle, setDarkToggle] = React.useState(false);
  return (
    <>
      <div className="flex items-center justify-center">
        <div className={`h-screen w-full ${darkToggle && "dark"}`}>
          <div className="h-screen w-full flex items-center justify-center flex-col bg-gray-300 dark:bg-gray-800">
            <label className="toggleDarkBtn">
              <input
                type="checkbox"
                onClick={() => setDarkToggle(!darkToggle)}
              />
              <span className="slideBtnTg bg-gray-400 round"></span>
            </label>
            <div className="w-80 sm:w-96 overflow-hidden bg-gray-100 p-5 rounded-xl mt-4 text-white dark:bg-gray-900 dark:backdrop-blur-xl drop-shadow-lg">
              <div className="md:w-1/3 flex items-start justify-center">
                {/* <div id="fb-root"></div>
            <div className="fb-like-box mb-5 border-4 rounded-sm border-blue-500 z-10"
               data-href="https://m.facebook.com/people/Iglesia-Evangelica-Hermon/100064624004737"
               data-width="292" 
               data-show-faces="false" 
               data-header="true" 
               data-stream="true" 
               data-show-border="true">
            </div> */}
              </div>
              <div className="px-6 py-2 text-center">
                <div className="text-gray-800 dark:text-gray-200 font-bold text-xl mb-2">
                  Radio Hermón
                </div>
                <div className="flex justify-center text-sm text-grey-darker">
                  <audio
                    className="w-64 sm:w-full text-wht rounded-full bg-gradient-to-t from-blue-500 to-blue-100 bg-blue-500 dark:shadow-lg dark:shadow-blue-500/30 shadow-lg shadow-blue-500/50 border-[1px] border-blue-400"
                    autoPlay
                    controls
                    src="https://radiointernet.co/8020/stream"
                  ></audio>
                </div>
                {/* <div className="flex flex-row items-center justify-center space-x-2 pt-4 text-center text-black dark:text-white">
              <i className="icon-facebook text-md hover:underline hover:underline-offset-4" />
              </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
