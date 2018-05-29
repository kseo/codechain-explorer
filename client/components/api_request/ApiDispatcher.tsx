import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { RootState } from "../../redux/actions";

interface HandlerProps {
    onStart?: () => void,
    onFinish?: (...args: any[]) => void,
    onError?: (e: Error) => void,
}

interface Props {
    api: string;
    requestProps?: any;
    body?: any;
    reducer: (state: RootState, request: any, json: any) => Partial<RootState>
}

interface ExternalProps {
    dispatch: Dispatch;
}

class ApiDispatcherInternal extends React.Component<Props & HandlerProps & ExternalProps> {
    public componentDidMount() {
        const { dispatch, api, body, reducer, requestProps } = this.props;
        this.emitStart();
        fetch(`http://localhost:8081/api/${api}`, body && {
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST",
        })
            .then(async res => {
                if (res.status === 200) {
                    return res.json();
                } else if (res.status === 400) {
                    throw new Error(await res.text());
                }
                throw new Error(res.statusText);
            })
            .then(response => {
                dispatch({
                    type: "API_DISPATCHER_OK",
                    getUpdate: (state: RootState) => reducer(state, requestProps, response)
                });
                this.emitFinish(response);
            })
            .catch(err => {
                dispatch({
                    type: "API_DISPATCHER_ERROR",
                    getUpdate: (state: RootState) => state
                });
                this.emitError(err.message);
            });
    }

    public render() {
        return <div/>;
    }

    private emitStart() {
        const { onStart } = this.props;
        if (onStart) {
            try {
                onStart();
            } catch (e) {
                console.error(e);
            }
        }
    }

    private emitFinish(...args: any[]) {
        const { onFinish } = this.props;
        if (onFinish) {
            try {
                onFinish(...args);
            } catch (e) {
                console.error(e);
            }
        }
    }

    private emitError(e: Error) {
        const { onError } = this.props;
        if (onError) {
            try {
                onError(e);
            } catch (e) {
                console.error(e);
            }
        }
    }
}

const ApiDispatcher = connect(
    (state: RootState) => {
        return {};
    },
    (dispatch: Dispatch) => {
        return { dispatch };
    }
)(ApiDispatcherInternal);

export default ApiDispatcher;