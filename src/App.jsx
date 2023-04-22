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
            <div className="w-80 sm:w-96 overflow-hidden bg-gray-100 p-5 rounded-xl mt-4 text-white dark:bg-gray-900 transform filter backdrop-filter backdrop-blur-md bg-opacity-40 firefox:bg-opacity-50 opacity-80">
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
              <div className="px-6 text-center">
                <div className="text-gray-800 dark:text-gray-200 font-bold text-xl mb-5">
                  Radio Hermón
                </div>
                <div className="flex justify-center text-sm text-grey-darker">
                  <audio
                    className="w-64 sm:w-full text-wht rounded-full bg-gradient-to-t from-gray-200 to-gray-600 dark:bg-gradient-to-t dark:from-blue-500 dark:to-blue-100 dark:shadow-lg dark:shadow-blue-500/30 shadow-lg shadow-blue-500/50 border-[1px] border-blue-400 dark:border-none"
                    autoPlay
                    controls
                    src="https://radiointernet.co/8020/stream"
                  ></audio>
                </div>
                <div className="flex flex-row items-center justify-center space-x-2 pt-5 text-center">
                  <a
                    href="https://www.facebook.com/profile.php?id=100064624004737"
                    className="pointer-cursor"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <button
                      type="button"
                      className="text-white hover:text-[#3b5998] bg-[#3b5998] hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:hover:text-gray-800 dark:hover:bg-gray-400 hover:drop-shadow-md w-42 icon-facebook-squared text-md active:no-underline no-underline focus:outline-none rounded-full text-sm px-3 py-1 text-center inline-flex items-center justify-center transition-all duration-200"
                    >
                      Facebook<div></div>
                    </button>
                  </a>
                  <a
                    href="https://twitter.com/IglesiaHermon/"
                    className="pointer-cursor"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <button
                      type="button"
                      className="text-white hover:text-[#00aced] bg-[#00aced] hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:hover:text-gray-800 dark:hover:bg-gray-400 hover:drop-shadow-md w-42 icon-twitter-3 text-md active:no-underline no-underline focus:outline-none rounded-full text-sm px-3 py-1 text-center inline-flex items-center justify-center transition-all duration-200"
                    >
                      Twitter<div></div>
                    </button>
                  </a>
                  <a
                    href="https://www.instagram.com/iglesiaevangelicahermon/"
                    className="pointer-cursor"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <button
                      type="button"
                      className="text-white hover:text-[#bc2a8d] bg-[#bc2a8d] hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:hover:text-gray-800 dark:hover:bg-gray-400 hover:drop-shadow-md w-42 icon-instagram-1 text-md active:no-underline no-underline focus:outline-none rounded-full text-sm px-3 py-1 text-center inline-flex items-center justify-center transition-all duration-200"
                    >
                      Instagram<div></div>
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
