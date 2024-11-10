import clsx from 'clsx'

type HeaderProps = { level?: 1 | 2 | 3 | 4 | 5 | 6 } & React.ComponentPropsWithoutRef<
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
>

export function Header({ className, level = 1, ...props }: HeaderProps) {
  let Element: `h${typeof level}` = `h${level}`

  return (
    <Element
      {...props}
      className={clsx(className, 'font-semibold text-zinc-950 dark:text-white text-xl')}
    />
  )
}

export function Subheader({ className, level = 2, ...props }: HeaderProps) {
  let Element: `h${typeof level}` = `h${level}`

  return (
    <Element
      {...props}
      className={clsx(className, 'text-base/7 font-semibold text-zinc-950 sm:text-sm/6 dark:text-white')}
    />
  )
}
