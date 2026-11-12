import * as React from "react"
import { useContext } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, EffectCards, EffectCoverflow } from "swiper/modules"
import { Card, CardPreview, tokens } from "@fluentui/react-components"
import { useEffect, useState } from "react"
import { useListItems } from "pnp-react-hooks/hooks/sp/useListItems"
import { ListOptions } from "pnp-react-hooks/types/options/ListOptions"

// Import Swiper styles
import "swiper/css"
import "swiper/css/effect-coverflow"

import { AwardItems } from "../types/AwardItems"
import styles from "../webparts/awardRecognition/components/AwardRecognition.module.scss"
import { Content } from "./Content"
import { WebpartContext } from "../webparts/awardRecognition/components/AwardRecognition"
import { getCardLayoutType } from "../utils/carousel"

export const Carousel = (): JSX.Element => {
  const contextInfo = useContext(WebpartContext)

  const [awardList, setAwardList] = useState<AwardItems[]>([])
  const [selectedUser, setSelectedUser] = useState<AwardItems | null>(null)

  const listItems = useListItems<AwardItems>("Award Recognition", {
    query: {
      select: ["ID", "Title", "Designation", "UserImage"],
    },
    mode: ListOptions.All,
  })

  useEffect(() => {
    if (listItems && listItems.length > 0) {
      const parsedData = listItems.map((item) => {
        const AppImageUrl = JSON.parse(item.UserImage)
        const ImageUrl = `${contextInfo.context.pageContext.web.serverRelativeUrl}/Lists/Award%20Recognition/Attachments/${item.ID}/${AppImageUrl.fileName}`
        return { ...item, ImageUrl }
      })
      setAwardList(parsedData)
      if (selectedUser === null) {
        setSelectedUser(parsedData[0])
      }
    }
    console.log("contextInfo", contextInfo)
  }, [listItems, selectedUser])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSlideChange = (swiper: any): void => {
    const realIndex = swiper.realIndex
    setSelectedUser(awardList[realIndex])
  }

  const isVertical = contextInfo.scrollDirection === "vertical"
  const autoplayEnabled = !!contextInfo.autoScroll
  const autoplayDelay = Math.max(1, contextInfo.autoScrollDelay || 3) * 1000
  const verticalHeight = contextInfo.verticalHeight || 520
  const fadeEdgeColor = tokens.colorNeutralBackground4Selected

  const cardStyles =
    contextInfo.cardStyle === "rounded"
      ? {
          width: "400px",
          height: "400px",
          borderRadius: "100%",
        }
      : {
          width: "300px",
          height: "400px",
          borderRadius: "9px",
        }

  return (
    <div className={styles.container}>
      <aside className={styles.asideWrapper}>
        <Content user={selectedUser} />
      </aside>
      <aside className={styles.carouselWrapper}>
        {isVertical ? (
          <>
            <div
              className={styles.fade_top}
              style={{
                background: `linear-gradient(to bottom, ${fadeEdgeColor}, transparent)`,
              }}
            />
            <div
              className={styles.fade_bottom}
              style={{
                background: `linear-gradient(to top, ${fadeEdgeColor}, transparent)`,
              }}
            />
          </>
        ) : (
          <>
            <div
              className={styles.fade_left}
              style={{
                background: `linear-gradient(to right, ${fadeEdgeColor}, transparent)`,
              }}
            />
            <div
              className={styles.fade_right}
              style={{
                background: `linear-gradient(to left, ${fadeEdgeColor}, transparent)`,
              }}
            />
          </>
        )}
        <Swiper
          // Re-mount Swiper when layout-affecting options change; Swiper does
          // not support switching direction or autoplay on a live instance.
          key={`${isVertical ? "v" : "h"}-${autoplayEnabled ? autoplayDelay : 0}-${contextInfo.pauseOnHover ? 1 : 0}-${contextInfo.animationChoice}-${contextInfo.cardType}`}
          direction={isVertical ? "vertical" : "horizontal"}
          style={isVertical ? { height: `${verticalHeight}px` } : undefined}
          autoplay={
            autoplayEnabled
              ? {
                  delay: autoplayDelay,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: !!contextInfo.pauseOnHover,
                }
              : false
          }
          effect={getCardLayoutType(contextInfo.cardType)}
          grabCursor={true}
          rewind={contextInfo.animationChoice === "rewind" ? true : false}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 120,
            modifier: 3.5,
            slideShadows: false,
          }}
          cardsEffect={{
            slideShadows: false,
          }}
          keyboard={{ enabled: true }}
          mousewheel={{
            thresholdDelta: 70,
          }}
          breakpoints={
            isVertical
              ? undefined
              : {
                  640: {
                    slidesPerView: 2,
                  },
                  1024: {
                    slidesPerView: 3,
                  },
                }
          }
          slidesPerView={isVertical ? "auto" : 2}
          modules={[Autoplay, EffectCards, EffectCoverflow]}
          centeredSlides
          spaceBetween={30}
          loop={contextInfo.animationChoice === "loop" ? true : false}
          onSlideChange={(swiper) => handleSlideChange(swiper)}
        >
          {awardList?.map((user, index) => (
            <SwiperSlide
              key={index}
              className={isVertical ? styles.verticalSlide : undefined}
              style={isVertical ? { height: cardStyles.height } : undefined}
            >
              <Card style={cardStyles}>
                <CardPreview style={{ height: "inherit" }}>
                  <img src={user.ImageUrl} alt={user.Title} />
                </CardPreview>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </aside>
    </div>
  )
}
