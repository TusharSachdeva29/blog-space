import { useState, useRef, useEffect } from "react";

const InpageNavigation = ({ routes ,defaultHidden =[], defaultActiveIndex =0,children}) => {
  const [inpageNavIndex, setInpageNavIndex] = useState(defaultActiveIndex);
  const activeTabLineRef = useRef(null);
  let activeTabRef = useRef()

  const changePageState = (btn, i) => {
    console.log(btn, i);
    const { offsetWidth, offsetLeft } = btn;

    if (activeTabLineRef.current) {
      activeTabLineRef.current.style.width = `${offsetWidth}px`;
      activeTabLineRef.current.style.left = `${offsetLeft}px`;
    }
    setInpageNavIndex(i);
  };

  useEffect(() => {
    changePageState(activeTabRef.current,defaultActiveIndex)
  },[])

  return (
    <>
      <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto">
        {routes.map((route, i) => (
          <button
            ref={i==defaultActiveIndex ? activeTabRef : null}
            
            key={i}
            className={
              "p-4 px-5 capitalize " +
              (inpageNavIndex ==  i ? "text-black" : "text-dark-grey ") + (defaultHidden.includes(route) ? " md:hidden " : " ")
            }
            onClick={(e) => changePageState(e.target, i)}
          >
            {route}
          </button>
        ))}
        <hr ref={activeTabLineRef} className="absolute bottom-0 duration-300" />
      </div>

      {Array.isArray(children) ? children[inpageNavIndex] : children}
    </>
  );
};

export default InpageNavigation;