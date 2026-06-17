import { useEffect, useRef } from "react";
import { Stack, Tooltip } from "@mui/material";

const defaultImageStyle = {
  width: "100%",
  borderRadius: 6,
  border: "1px solid #eee",
};

export default function ImageTooltip({
  children,
  imageSrc,
  imageAlt = "",
  header,
  footer,
  content,
  contentMaxWidth = 520,
  tooltipMaxWidth = 560,
  imageSx,
  slotProps,
  ...tooltipProps
}) {
  const popperRef = useRef(null);

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.src = imageSrc;
  }, [imageSrc]);

  const handleImageLoad = () => {
    popperRef.current?.update?.();
  };

  const tooltipTitle =
    content ??
    ((
      <Stack spacing={1.5} sx={{ maxWidth: contentMaxWidth }}>
        {header}
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={imageAlt}
            onLoad={handleImageLoad}
            style={{ ...defaultImageStyle, ...imageSx }}
          />
        ) : null}
        {footer}
      </Stack>
    ));

  return (
    <Tooltip
      {...tooltipProps}
      title={tooltipTitle}
      slotProps={{
        ...slotProps,
        popper: {
          ...slotProps?.popper,
          popperRef,
          keepMounted: true,
        },
        tooltip: {
          ...slotProps?.tooltip,
          sx: {
            p: 2,
            maxWidth: tooltipMaxWidth,
            ...slotProps?.tooltip?.sx,
          },
        },
      }}
    >
      {children}
    </Tooltip>
  );
}
