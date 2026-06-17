"use client";
import { useScroll, useTransform, motion, useMotionValueEvent } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

const TimelineBullet = ({ heightTransform, wrapperRef }) => {
  const [reached, setReached] = useState(false);
  const reachedRef = useRef(false);

  useMotionValueEvent(heightTransform, "change", (h) => {
    if (!wrapperRef?.current) return;
    const isNowReached = h >= wrapperRef.current.offsetTop;
    if (isNowReached !== reachedRef.current) {
      reachedRef.current = isNowReached;
      setReached(isNowReached);
    }
  });

  return (
    <div className="absolute flex items-center justify-center w-10 h-10 rounded-full -left-[15px] bg-midnight">
      <motion.div
        className="relative flex items-center justify-center w-4 h-4 rounded-full border"
        animate={{
          backgroundColor: reached ? "#0c8a99" : "#262626",
          borderColor: reached ? "#33c2cc" : "#404040",
          scale: reached ? [1, 1.8, 1] : 1,
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {reached && (
          <motion.span
            key="ring"
            className="absolute inset-0 rounded-full bg-aqua/30"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        )}
      </motion.div>
    </div>
  );
};

export const Timeline = ({ data }) => {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const [height, setHeight] = useState(0);
  const itemRefs = useRef([]);

  // Ensure stable ref objects for each item
  data.forEach((_, i) => {
    if (!itemRefs.current[i]) {
      itemRefs.current[i] = { current: null };
    }
  });

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className="c-space section-spacing" ref={containerRef}>
      <h2 className="text-heading">My Work Experience</h2>
      <div ref={ref} className="relative pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            ref={(el) => { itemRefs.current[index].current = el; }}
            className="flex justify-start pt-10 md:pt-40 md:gap-10"
          >
            <div className="sticky z-40 flex flex-col items-center self-start max-w-xs md:flex-row top-40 lg:max-w-sm md:w-full">
              <TimelineBullet
                heightTransform={heightTransform}
                wrapperRef={itemRefs.current[index]}
              />
              <div className="flex-col hidden gap-2 text-xl font-bold md:flex md:pl-20 md:text-4xl text-neutral-300">
                <h3>{item.date}</h3>
                <h3 className="text-3xl text-neutral-400">{item.title}</h3>
                <h3 className="text-3xl text-neutral-500">{item.job}</h3>
              </div>
            </div>

            <div className="relative w-full pl-20 pr-4 md:pl-4">
              <div className="block mb-4 text-2xl font-bold text-left text-neutral-300 md:hidden">
                <h3>{item.date}</h3>
                <h3>{item.job}</h3>
              </div>
              {item.contents.map((content, i) => (
                <p className="mb-3 font-normal text-neutral-400" key={i}>
                  {content}
                </p>
              ))}
            </div>
          </div>
        ))}

        <div
          style={{ height: height + "px" }}
          className="absolute md:left-1 left-1 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-700 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{ height: heightTransform, opacity: opacityTransform }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-aqua via-teal/50 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
