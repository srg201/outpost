import { ReactNode } from 'react'

const MainLayout = ({children}: {children: ReactNode}) => {
  return (
    <div className='flex flex-1 flex-col'>{children}</div>
  )
}

export default MainLayout