// Utils
import { cn } from "@/shared/utils/cn";

// React
import { Children, cloneElement, useState } from "react";

/**
 * Generic SVG map wrapper with tooltip on hover and active region on click.
 * Supports controlled mode via `value` prop, or uncontrolled (internal state).
 *
 * @param {object} props
 * @param {string} props.viewBox - SVG viewBox attribute value
 * @param {React.ReactNode} props.children - SVG <path> elements
 * @param {number} [props.strokeWidth] - Stroke width applied to all paths via SVG context
 * @param {string} [props.className] - Additional class names for the Card
 * @param {string} [props.value] - Controlled active region (data-title value)
 * @param {function} [props.onChange] - Called with the clicked region's data-title value
 */
const MapWrapper = ({
  value,
  viewBox,
  onChange,
  children,
  strokeWidth,
  className = "",
}) => {
  const [tooltip, setTooltip] = useState({
    x: 0,
    y: 0,
    title: "",
    visible: false,
  });
  const [internalActive, setInternalActive] = useState(null);

  // controlled mode when `value` prop is provided
  const activeRegion = value !== undefined ? value : internalActive;

  const handleMouseMove = (e) => {
    const title = e.target.dataset.title;
    if (!title) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      title,
      visible: true,
      y: e.clientY - rect.top - 36,
      x: e.clientX - rect.left,
    });
  };

  const handleMouseLeave = () => setTooltip((t) => ({ ...t, visible: false }));

  const handleClick = (e) => {
    const title = e.target.dataset.title;
    if (!title) return;
    if (value === undefined) setInternalActive(title);
    onChange?.(title);
  };

  return (
    <div className={cn("flex items-center justify-center relative", className)}>
      <svg
        stroke="#fff"
        viewBox={viewBox}
        onClick={handleClick}
        strokeWidth={strokeWidth}
        className="map-wrapper-svg"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        xmlns="http://www.w3.org/2000/svg"
      >
        {Children.map(children, (child, i) =>
          cloneElement(child, {
            key: i,
            className:
              child.props["data-title"] === activeRegion ? "active" : undefined,
          }),
        )}
      </svg>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          style={{ left: tooltip.x, top: tooltip.y }}
          className="pointer-events-none absolute z-10 rounded bg-gray-800 px-2 py-1 text-xs text-white shadow transition-all delay-300 duration-1000"
        >
          {tooltip.title}
        </div>
      )}
    </div>
  );
};

export default MapWrapper;
