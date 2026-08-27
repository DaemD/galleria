"use client";

import Autoplay from "embla-carousel-autoplay";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface Carousel_006Props {
  images: { src: string; alt: string; title: string }[];
  className?: string;
  autoplay?: boolean;
  loop?: boolean;
  showNavigation?: boolean;
  showPagination?: boolean;
  tone?: "light" | "dark";
  onCurrentChange?: (
    index: number,
    image: { src: string; alt: string; title: string },
  ) => void;
}

const Carousel_006 = ({
  images,
  className,
  autoplay = false,
  loop = true,
  showNavigation = true,
  showPagination = true,
  tone = "light",
  onCurrentChange,
}: Carousel_006Props) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    const sync = () => {
      const index = api.selectedScrollSnap();
      setCurrent(index);
      const image = images[index];
      if (image) onCurrentChange?.(index, image);
    };

    sync();
    api.on("select", sync);
    return () => {
      api.off("select", sync);
    };
  }, [api, images, onCurrentChange]);

  if (images.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center px-6 text-center text-[14px] tracking-[-0.224px] text-[var(--color-ink-muted-48)]">
        Pull a memory first — your deck starts empty.
      </div>
    );
  }

  return (
    <Carousel
      setApi={setApi}
      className={cn("w-full", className)}
      opts={{
        loop,
        slidesToScroll: 1,
      }}
      plugins={
        autoplay
          ? [
              Autoplay({
                delay: 2000,
                stopOnInteraction: true,
                stopOnMouseEnter: true,
              }),
            ]
          : []
      }
    >
      <CarouselContent className="flex h-[500px] w-full">
        {images.map((img, index) => (
          <CarouselItem
            key={index}
            className="relative flex h-[81.5%] w-full basis-[73%] items-center justify-center sm:basis-[50%] md:basis-[30%] lg:basis-[25%] xl:basis-[21%]"
          >
            <motion.div
              initial={false}
              animate={{
                clipPath:
                  current !== index
                    ? "inset(15% 0 15% 0 round 18px)"
                    : "inset(0 0 0 0 round 18px)",
              }}
              className={cn(
                "h-full w-full overflow-hidden rounded-[18px]",
                current === index && "product-shadow",
              )}
            >
              <div className="relative h-full w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-full w-full scale-105 object-cover"
                />
              </div>
            </motion.div>
            <AnimatePresence mode="wait">
              {current === index && (
                <motion.div
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    "absolute bottom-0 left-2 flex h-[14%] w-full translate-y-full items-center justify-center p-2 text-center text-[14px] font-semibold tracking-[-0.224px]",
                    tone === "dark"
                      ? "text-[var(--color-body-muted)]"
                      : "text-[var(--color-ink-muted-48)]",
                  )}
                >
                  {img.title}
                </motion.div>
              )}
            </AnimatePresence>
          </CarouselItem>
        ))}
      </CarouselContent>

      {showNavigation && (
        <div className="absolute -bottom-4 right-0 flex w-full items-center justify-between gap-2 px-4">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => api?.scrollPrev()}
            className={cn(
              "btn-chip",
              tone === "dark" && "btn-chip-on-dark",
            )}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => api?.scrollNext()}
            className={cn(
              "btn-chip",
              tone === "dark" && "btn-chip-on-dark",
            )}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}

      {showPagination && (
        <div className="mt-8 flex w-full items-center justify-center">
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: images.length }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "h-2 w-2 cursor-pointer rounded-full transition-all",
                  current === index
                    ? tone === "dark"
                      ? "bg-white"
                      : "bg-[var(--color-ink)]"
                    : tone === "dark"
                      ? "bg-white/35"
                      : "bg-[var(--color-hairline)]",
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </Carousel>
  );
};

export { Carousel_006 };
