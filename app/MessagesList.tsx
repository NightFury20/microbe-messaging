import { Message } from '@/lib/data-types/message';

export const MessagesList = (props: { messages: Message[] }) => {
    return (
        <div>
            {props.messages.map((message) => (
                <div key={message.id}>
                    <strong>{message.sentBy.username}:</strong>{' '}
                    {message.content}
                </div>
            ))}
        </div>
    );
};
