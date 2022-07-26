import React from "react";

interface AspectRatioProps {
  children?: any;
  /**
    Should be 'height / width'.
    Some common aspect ratios:
      1:1 = 1.0, 4:3 = 0.75, 16:9 = 0.5625
   */
  ratio: number;
  maxWidth?: number;
}

const AspectRatio = (props: AspectRatioProps) => {
  const { maxWidth, children, ratio } = props;

  const mainDivStyle = maxWidth
    ? { maxWidth: `${maxWidth}px`, maxHeight: `${maxWidth * ratio}px` }
    : undefined;
  const outerWrapperStyle: React.CSSProperties = {
    paddingBottom: `${ratio * 100}%`,
    position: "relative",
    width: "100%",
    height: 0,
  };
  const innerWrapperStyle: React.CSSProperties = {
    position: "absolute",
    top: "0",
    right: "0",
    bottom: "0",
    left: "0",
  }

  return (
    <div className="AspectRatio" style={mainDivStyle}>
      <div className="AspectRatio-outerWrapper" style={outerWrapperStyle}>
        <div className="AspectRatio-innerWrapper" style={innerWrapperStyle}>{children}</div>
      </div>
    </div>
  );
};

export default AspectRatio;