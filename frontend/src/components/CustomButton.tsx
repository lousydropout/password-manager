import { colors } from '@/utils/colors'
import { Button, ButtonProps } from '@chakra-ui/react'

export interface CustomButtonProps extends ButtonProps {
  colorScheme: 'primary' | 'secondary' | 'accent' | 'warning'
}

const CustomButton: React.FC<CustomButtonProps> = ({ colorScheme, children, ...rest }) => {
  return (
    <Button {...colors[colorScheme]} {...rest}>
      {children}
    </Button>
  )
}

export { CustomButton }
