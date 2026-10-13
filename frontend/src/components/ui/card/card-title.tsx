import * as React from "react"
import { cn } from "cn"

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-lg leading-snug font-bold group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { CardTitle }