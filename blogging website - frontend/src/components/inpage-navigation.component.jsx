import { useState, useRef } from "react";

const InpageNavigation = ({ routes }) => {
  const [inpageNavIndex, setInpageNavIndex] = useState(0);
  const activeTabLineRef = useRef(null);

  const changePageState = (btn, i) => {
    console.log(btn, i);
    const { offsetWidth, offsetLeft } = btn;

    if (activeTabLineRef.current) {
      activeTabLineRef.current.style.width = `${offsetWidth}px`;
      activeTabLineRef.current.style.left = `${offsetLeft}px`;
    }
    setInpageNavIndex(i);
  };

  return (
    <>
      <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto">
        {routes.map((route, i) => (
          <button
            key={i}
            className={
              "p-4 px-5 capitalize " +
              (inpageNavIndex === i ? "text-black" : "text-dark-grey")
            }
            onClick={(e) => changePageState(e.target, i)}
          >
            {route}
          </button>
        ))}
        <hr ref={activeTabLineRef} className="absolute bottom-0 duration-300" />
      </div>
    </>
  );
};

export default InpageNavigation;