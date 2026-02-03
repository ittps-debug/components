"use client"

import { type HTMLMotionProps, motion, type Transition } from "motion/react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { MotionHighlight, MotionHighlightItem } from "~/packages/text/motion-highlight"

// Tabs Component
interface TabsContextType<T extends string> {
  activeValue: T
  handleValueChange: (value: T) => void
  registerTrigger: (value: T, node: HTMLElement | null) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TabsContext = React.createContext<TabsContextType<any> | undefined>(undefined)

function useTabs<T extends string = string>(): TabsContextType<T> {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error("useTabs must be used within a TabsProvider")
  }
  return context
}

type BaseTabsProps = React.ComponentProps<"div"> & {
  children: React.ReactNode
}

type UnControlledTabsProps<T extends string = string> = BaseTabsProps & {
  defaultValue?: T
  value?: never
  onValueChange?: never
}

type ControlledTabsProps<T extends string = string> = BaseTabsProps & {
  value: T
  onValueChange?: (value: T) => void
  defaultValue?: never
}

type TabsProps<T extends string = string> = UnControlledTabsProps<T> | ControlledTabsProps<T>

function Tabs<T extends string = string>({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
  ...props
}: TabsProps<T>) {
  const [activeValue, setActiveValue] = React.useState<T | undefined>(defaultValue ?? undefined)
  const triggersRef = React.useRef(new Map<string, HTMLElement>())
  const initialSet = React.useRef(false)
  const isControlled = value !== undefined

  React.useEffect(() => {
    if (
      !isControlled &&
      activeValue === undefined &&
      triggersRef.current.size > 0 &&
      !initialSet.current
    ) {
      const firstTab = Array.from(triggersRef.current.keys())[0]
      setActiveValue(firstTab as T)
      initialSet.current = true
    }
  }, [activeValue, isControlled])

  const registerTrigger = (value: string, node: HTMLElement | null) => {
    if (node) {
      triggersRef.current.set(value, node)
      if (!isControlled && activeValue === undefined && !initialSet.current) {
        setActiveValue(value as T)
        initialSet.current = true
      }
    } else {
      triggersRef.current.delete(value)
    }
  }

  const handleValueChange = (val: T) => {
    if (isControlled) {
      onValueChange?.(val)
    } else {
      setActiveValue(val)
    }
  }

  return (
    <TabsContext.Provider
      value={{
        activeValue: (value ?? activeValue)!,
        handleValueChange,
        registerTrigger,
      }}
    >
      <div className={cn("flex flex-col gap-2", className)} data-slot="tabs" {...(props as any)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

type TabsListProps = React.ComponentProps<"div"> & {
  children: React.ReactNode
  activeClassName?: string
  transition?: Transition
}

function TabsList({
  children,
  className,
  activeClassName,
  transition = {
    type: "spring",
    stiffness: 200,
    damping: 25,
  },
  ...props
}: TabsListProps) {
  const { activeValue } = useTabs()

  return (
    <MotionHighlight
      className={cn("rounded-sm bg-background shadow-sm", activeClassName)}
      controlledItems
      transition={transition}
      value={activeValue}
    >
      <div
        className={cn(
          "bg-muted text-muted-foreground inline-flex h-10 w-fit items-center justify-center rounded-lg p-[4px]",
          className,
        )}
        data-slot="tabs-list"
        role="tablist"
        {...(props as any)}
      >
        {children}
      </div>
    </MotionHighlight>
  )
}

type TabsTriggerProps = HTMLMotionProps<"button"> & {
  value: string
  children: React.ReactNode
}

function TabsTrigger({ ref, value, children, className, ...props }: TabsTriggerProps) {
  const { activeValue, handleValueChange, registerTrigger } = useTabs()

  const localRef = React.useRef<HTMLButtonElement | null>(null)
  React.useImperativeHandle(ref as any, () => localRef.current as HTMLButtonElement)

  React.useEffect(() => {
    registerTrigger(value, localRef.current)
    return () => registerTrigger(value, null)
  }, [value, registerTrigger])

  return (
    <MotionHighlightItem className="size-full" value={value}>
      <motion.button
        className={cn(
          "inline-flex cursor-pointer items-center size-full justify-center whitespace-nowrap rounded-sm px-2 py-1 text-sm font-medium ring-offset-background transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground z-[1]",
          className,
        )}
        data-slot="tabs-trigger"
        data-state={activeValue === value ? "active" : "inactive"}
        onClick={() => handleValueChange(value)}
        ref={localRef}
        role="tab"
        whileTap={{ scale: 0.95 }}
        {...(props as any)}
      >
        {children}
      </motion.button>
    </MotionHighlightItem>
  )
}

type TabsContentsProps = React.ComponentProps<"div"> & {
  children: React.ReactNode
  transition?: Transition
}

function TabsContents({
  children,
  className,
  transition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    bounce: 0,
    restDelta: 0.01,
  },
  ...props
}: TabsContentsProps) {
  const { activeValue } = useTabs()
  const childrenArray = React.Children.toArray(children)
  const activeIndex = childrenArray.findIndex(
    (child): child is React.ReactElement<{ value: string }> =>
      React.isValidElement(child) &&
      typeof child.props === "object" &&
      child.props !== null &&
      "value" in child.props &&
      child.props.value === activeValue,
  )

  return (
    <div className={cn("overflow-hidden", className)} data-slot="tabs-contents" {...(props as any)}>
      <motion.div
        animate={{ x: `${activeIndex * -100}%` }}
        className="flex -mx-2"
        transition={transition}
      >
        {childrenArray.map((child, index) => (
          <div className="w-full shrink-0 px-2" key={index}>
            {child}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

type TabsContentProps = HTMLMotionProps<"div"> & {
  value: string
  children: React.ReactNode
}

function TabsContent({ children, value, className, ...props }: TabsContentProps) {
  const { activeValue } = useTabs()
  const isActive = activeValue === value
  return (
    <motion.div
      animate={{ filter: isActive ? "blur(0px)" : "blur(4px)" }}
      className={cn("overflow-hidden", className)}
      data-slot="tabs-content"
      exit={{ filter: "blur(0px)" }}
      initial={{ filter: "blur(0px)" }}
      role="tabpanel"
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      {...(props as any)}
    >
      {children}
    </motion.div>
  )
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContents,
  TabsContent,
  useTabs,
  type TabsContextType,
  type TabsProps,
  type TabsListProps,
  type TabsTriggerProps,
  type TabsContentsProps,
  type TabsContentProps,
}

// Demo
export function Demo() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-64 w-96 bg-muted/50 animate-pulse rounded-lg" />
  }

  return (
    <div className="flex items-center justify-center h-screen w-screen p-4">
      <Tabs defaultValue="account" className="w-full max-w-md">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContents className="mt-4">
          <TabsContent value="account">
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-semibold">Account Settings</h3>
              <p className="text-sm text-muted-foreground">
                Manage your account details and preferences. Update your profile information, email
                address, and connected accounts.
              </p>
              <div className="flex gap-2 pt-2">
                <div className="h-9 w-24 bg-primary rounded-md" />
                <div className="h-9 w-24 bg-secondary rounded-md" />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="password">
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-semibold">Password & Security</h3>
              <p className="text-sm text-muted-foreground">
                Update your password and manage two-factor authentication. We recommend using a
                strong, unique password.
              </p>
              <div className="space-y-2 pt-2">
                <div className="h-9 w-full bg-secondary rounded-md" />
                <div className="h-9 w-full bg-secondary rounded-md" />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="settings">
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-semibold">General Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure your app preferences including notifications, language, and display
                options.
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notifications</span>
                  <div className="h-5 w-9 bg-primary rounded-full" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dark Mode</span>
                  <div className="h-5 w-9 bg-secondary rounded-full" />
                </div>
              </div>
            </div>
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  )
}

