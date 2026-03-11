import React from "react";
import { Link } from "react-router-dom";

import {
  Breadcrumb as Root,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/shadcn/breadcrumb.jsx";

/**
 * Simple breadcrumb UI.
 * @param {Object} props
 * @param {{label: string, href?: string, onClick?: Function}[]} props.items
 * @param {number} [props.maxItems=5]
 * @param {string} [props.className]
 */
const Breadcrumb = ({ items = [], maxItems = 5, className }) => {
  const safeItems = Array.isArray(items) ? items : [];
  const total = safeItems.length;

  const head = total > maxItems ? safeItems.slice(0, 1) : [];
  const tail = total > maxItems ? safeItems.slice(-2) : safeItems;
  const middleHidden = total > maxItems;

  const nodes = [];
  head.forEach((item, index) => {
    nodes.push({
      key: `bc-head-${index}`,
      type: "item",
      item,
      isPage: false,
    });
  });

  if (middleHidden) {
    nodes.push({ key: "bc-ellipsis", type: "ellipsis" });
  }

  tail.forEach((item, index) => {
    const isLastItem = total > 0 && item === safeItems[total - 1];
    nodes.push({
      key: `bc-tail-${index}`,
      type: "item",
      item,
      isPage: isLastItem,
    });
  });

  return (
    <Root className={className}>
      <BreadcrumbList>
        {nodes.map((node, index) => (
          <React.Fragment key={node.key}>
            {node.type === "ellipsis" ? (
              <BreadcrumbItem>
                <BreadcrumbEllipsis />
              </BreadcrumbItem>
            ) : (
              <BreadcrumbItem>
                {node.isPage ? (
                  <BreadcrumbPage>{node.item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={node.item.href ?? "#"} onClick={node.item.onClick}>
                      {node.item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            )}
            {index < nodes.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Root>
  );
};

export default Breadcrumb;
