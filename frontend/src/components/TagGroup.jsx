import Tag, { nameToTag } from "./Tag";
import { Box, Stack, Tooltip } from "@mui/material";
import { useState, useLayoutEffect, useRef } from "react";

export default function TagGroup({
  tags,
  truncate = false,
  clickable = false,
  selectedTags = [],
  onTagClick = () => {},
}) {
  const containerRef = useRef(null);
  const hiddenRef = useRef(null);
  const [visibleTags, setVisibleTags] = useState(tags);
  const [hiddenTags, setHiddenTags] = useState([]);

  function computeVisibleTags() {
    const container = containerRef.current;
    const hidden = hiddenRef.current;
    if (!container || !hidden) return;

    const allTagNodes = Array.from(hidden.children);

    let isToTruncate = false,
      totalWidth = 0;
    for (let i = 0; i < allTagNodes.length; i++) {
      totalWidth += allTagNodes[i].offsetWidth + (i != 0 ? 8 : 0); // gap: 8px
      if (totalWidth > container.offsetWidth) {
        isToTruncate = true;
        break;
      }
    }

    // console.log(`firstWidth=${allTagNodes[0].offsetWidth} totalWidth=${totalWidth}`);

    if (!isToTruncate) {
      setVisibleTags(tags);
      setHiddenTags([]);
      return;
    }

    totalWidth = 0;
    let lastVisible = allTagNodes.length;
    for (let i = 0; i < allTagNodes.length; i++) {
      totalWidth += allTagNodes[i].offsetWidth + (i != 0 ? 8 : 0);
      if (totalWidth > container.offsetWidth - 32) {
        lastVisible = i - 1;
        break;
      }
    }

    // console.log(`lastVisibleIndex=${lastVisible}`);

    setVisibleTags([...tags.slice(0, lastVisible), nameToTag("…")]);
    setHiddenTags(tags.slice(lastVisible));
  }

  useLayoutEffect(() => {
    if (!truncate) {
      setVisibleTags(tags);
      return;
    }
    computeVisibleTags();
    const ro = new ResizeObserver(computeVisibleTags);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [tags, truncate]);

  return (
    <>
      {/* 不可见，仅用于测量tag的宽度 */}
      <div
        ref={hiddenRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          height: 0,
          overflow: "hidden",
        }}
      >
        {tags.map((tag) => (
          <Tag key={tag.description} tag={tag} />
        ))}
      </div>

      <Stack
        ref={containerRef}
        sx={{
          width: truncate ? "100%" : "auto",
          display: "flex",
          flexDirection: "row",
          flexWrap: truncate ? "nowrap" : "wrap",
          justifyContent: truncate ? "flex-start" : "center",
          gap: 1,
        }}
      >
        {visibleTags.map((t, idx) =>
          t.description === "…" ? (
            <Tooltip
              key={idx}
              placement="right-start"
              arrow
              title={
                <Box
                  sx={{
                    width: 93,
                    padding: 0.5,
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  {hiddenTags.map((t) => (
                    <Tag
                      key={t.description}
                      tag={t}
                      clickable={clickable}
                      selected={selectedTags.includes(t)}
                      onClick={onTagClick}
                    />
                  ))}
                </Box>
              }
            >
              <Box component="span">
                <Tag
                  key={t.description}
                  tag={t}
                  clickable={clickable}
                  selected={selectedTags.includes(t)}
                  onClick={onTagClick}
                />
              </Box>
            </Tooltip>
          ) : (
            <Tag
              key={t.description}
              tag={t}
              clickable={clickable}
              selected={selectedTags.includes(t)}
              onClick={onTagClick}
            />
          ),
        )}
      </Stack>
    </>
  );
}
