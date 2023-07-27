import { ExpandableSection, Text } from "@patternfly/react-core"
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons'

export type ConnectProps = {
    text: string[]
}

export const ConnectHint: React.FunctionComponent<ConnectProps> = props => {
    
    return (
        <ExpandableSection
        displaySize='large'
        toggleContent={
          <Text>
            <OutlinedQuestionCircleIcon /> Hint
          </Text>
            }
        >
        {
            props.text.map((text) => {
                return (
                    <Text component='p'>
                        {text}
                    </Text>
                ) 
            })
        }
      </ExpandableSection>
    )
}