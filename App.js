import React, { Component } from 'react';
import {
    View,
    Text,
    Button,
    Platform,
    TouchableOpacity,
    Linking,
    TextInput,
    ScrollView,
    StyleSheet,
    Alert,
} from 'react-native';
import NfcManager, { Ndef } from 'react-native-nfc-manager';
import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';

const RtdType = {
    URL: 0,
    TEXT: 1,
};

function buildUrlPayload(valueToWrite) {
    return Ndef.encodeMessage([
        Ndef.uriRecord(valueToWrite),
    ]);
}

function buildTextPayload(valueToWrite) {
    return Ndef.encodeMessage([
        Ndef.textRecord(valueToWrite),
    ]);
}

class App extends Component {
    constructor(props) {
        super(props);
        this.title = 'NFC test';
        this.loaded = false;
        this.state = {
            supported: true,
            enabled: false,
            isWriting: false,
            productInfor: {
                productNumber: '',
                productDate: '',
                deliveryDays: 0,
                deviceSKU: '',
                hardwareVersion: '',
                softwareVersion: '',
                specialMessages: '',
            },
            // rtdType: RtdType.URL,
            tag: {},
            isDateTimePickerVisible: false,
        }
    }

    componentDidMount() {
        NfcManager.isSupported()
            .then(supported => {
                this.setState({ supported });
                if (supported) {
                    this._startNfc();
                    this._startDetection();
                }
            })
    }

    componentWillUnmount() {
        this._stopDetection();
        if (this._stateChangedSubscription) {
            this._stateChangedSubscription.remove();
        }
    }

    render() {
        let { supported, enabled, tag, isWriting, productInfor, isDateTimePickerVisible, rtdType } = this.state;
        return (
            <ScrollView style={{ flex: 1 }}>
                {Platform.OS === 'ios' && <View style={{ height: 60 }} />}

                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', marginLeft: 20, }}>
                    <Text style={{ marginTop: 20, }}>{`Is NFC supported ? ${supported}`}</Text>
                    <Text>{`Is NFC enabled (Android only)? ${enabled}`}</Text>
                    {/* <Button style={{ marginTop: 10 }} onPress={this._goToNfcSetting} title='Go to NFC setting' /> */}
                    {/* <TouchableOpacity style={styles.button} onPress={this._goToNfcSetting}>
                        <Text style={styles.buttonLabel}>Go to NFC setting</Text>
                    </TouchableOpacity> */}
                    <Text style={{color: 'blue', borderBottomWidth: 1, borderBottomColor: 'blue'}} onPress={this._goToNfcSetting}>Go to NFC setting</Text>
                    <Text style={styles.header}>Product Information</Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>Product SKU:</Text>
                        <TextInput
                            style={styles.input}
                            value={productInfor.deviceSKU}
                            onChangeText={deviceSKU => {
                                this.state.productInfor.deviceSKU = deviceSKU;
                                this.setState({
                                    productInfor: this.state.productInfor
                                })
                            }}
                        />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Hardware Version:</Text>
                        <TextInput
                            style={styles.input}
                            value={productInfor.hardwareVersion}
                            onChangeText={hardwareVersion => {
                                this.state.productInfor.hardwareVersion = hardwareVersion;
                                this.setState({
                                    productInfor: this.state.productInfor
                                })
                            }}
                        />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Software Version:</Text>
                        <TextInput
                            style={styles.input}
                            value={productInfor.softwareVersion}
                            onChangeText={softwareVersion => {
                                this.state.productInfor.softwareVersion = softwareVersion;
                                this.setState({
                                    productInfor: this.state.productInfor
                                })
                            }}
                        />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Product NO.:</Text>
                        {/* <text>{productInfor.productNumber}</text> */}
                        <TextInput
                            style={styles.input}
                            editable={true}
                            value={productInfor.productNumber}
                            onChangeText={number => {
                                this.state.productInfor.productNumber = number;
                                this.setState({
                                    productInfor: this.state.productInfor
                                })
                            }}
                        />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>product Date:</Text>
                        {/* <Text style={[styles.input, {alignItems: 'center'}]} onPress={()=>{
                                this.setState({
                                    isDateTimePickerVisible: true
                                });
                        }}>{productInfor.productDate}</Text> */}
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{color: 'blue'}} onPress={() => {
                                this.setState({
                                    isDateTimePickerVisible: true
                                });
                            }}>Choose Date</Text>
                            <Text style={{ marginLeft: 10 }}>{productInfor.productDate ? moment(new Date(productInfor.productDate.toString())).format('MM/DD/YYYY') : ''}</Text>
                        </View>
                        {/* <TextInput
                            style={styles.input}
                            value={productInfor.productDate}
                            onFocus={() => {
                                this.setState({
                                    isDateTimePickerVisible: true
                                });
                            }}
                        /> */}
                        <DateTimePicker
                            isVisible={isDateTimePickerVisible}
                            date={new Date(productInfor.productDate)}
                            onConfirm={(date) => {
                                this.state.productInfor.productDate = date;
                                this.setState({
                                    isDateTimePickerVisible: false,
                                    productInfor: this.state.productInfor
                                });
                            }}
                            onCancel={() => {
                                this.setState({
                                    isDateTimePickerVisible: false
                                });
                            }}
                        />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Shipment Days:</Text>
                        <TextInput
                            style={styles.input}
                            value={productInfor.deliveryDays ? productInfor.deliveryDays.toString() : ''}
                            keyboardType={'numeric'}
                            onChangeText={days => {
                                this.state.productInfor.deliveryDays = days;
                                this.setState({
                                    productInfor: this.state.productInfor
                                })
                            }}
                        />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Special Messages:</Text>
                        <TextInput
                            style={styles.input}
                            value={productInfor.specialMessages}
                            onChangeText={specialMessages => {
                                this.state.productInfor.specialMessages = specialMessages;
                                this.setState({
                                    productInfor: this.state.productInfor
                                })
                            }}
                        />
                    </View>


                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={isWriting ? this._cancelNdefWrite : this._requestNdefWrite}>
                            <Text style={styles.buttonlabel}>{`${isWriting ? 'Cancel' : 'Write NDEF'}`}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button}
                            onPress={this._clearMessages}>
                            <Text style={styles.buttonlabel}>Clear</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button}
                            onPress={this._goToDetail}>
                            <Text style={styles.buttonlabel}>Load Details</Text>
                        </TouchableOpacity>

                        {/* <TouchableOpacity
                        style={{ marginTop: 20, borderWidth: 1, borderColor: 'blue', padding: 10 }}
                        onPress={isWriting ? this._cancelNdefWrite : this._requestFormat}>
                        <Text style={{ color: 'blue' }}>{`(android) ${isWriting ? 'Cancel' : 'Format'}`}</Text>
                    </TouchableOpacity> */}

                        {/* <TouchableOpacity
                                style={{ marginTop: 20, borderWidth: 1, borderColor: 'blue', padding: 10 }}
                                onPress={isWriting ? this._cancelAndroidBeam : this._requestAndroidBeam}>
                                <Text style={{ color: 'blue' }}>{`${isWriting ? 'Cancel ' : ''}Android Beam`}</Text>
                            </TouchableOpacity> */}
                    </View>
                </View>
            </ScrollView >
        )
    }

    _goToDetail = () => {
        // let url = '' + this.state.productInfor.productNumber;
        url = "https://google.com";
        Linking.openURL(url)
            .catch(err => {
                console.warn(err);
            })
    }
    _requestFormat = () => {
        let { isWriting } = this.state;
        if (isWriting) {
            return;
        }
        this.setState({ isWriting: true });
        NfcManager.requestNdefWrite(null, { format: true })
            .then(() => {
                console.log('format completed')
            })
            .catch(err => {
                console.warn(err)
            })
            .then(() => {
                this.setState({ isWriting: false })
            });
    }

    _requestNdefWrite = () => {
        let { isWriting, productInfor, rtdType } = this.state;
        if (isWriting) {
            return;
        }

        let bytes;
        bytes = buildTextPayload(JSON.stringify(productInfor));
        // if (rtdType === RtdType.URL) {
        //     bytes = buildUrlPayload(urlToWrite);
        // } else if (rtdType === RtdType.TEXT) {
        //     bytes = buildTextPayload(urlToWrite);
        // }

        this.setState({ isWriting: true });
        NfcManager.requestNdefWrite(bytes)
            .then(() => {
                Alert.alert(this.title, 'Write to NFC Completed!');
                console.log('write completed');
            })
            .catch(err => {
                Alert.alert(this.title, 'Write to NFC Failed!');
                console.warn(err)
            })
            .then(() => {
                this.setState({ isWriting: false })
            });
    }

    _cancelNdefWrite = () => {
        this.setState({ isWriting: false });
        NfcManager.cancelNdefWrite()
            .then(() => console.log('write cancelled'))
            .catch(err => console.warn(err))
    }

    _requestAndroidBeam = () => {
        let { isWriting, urlToWrite, rtdType } = this.state;
        if (isWriting) {
            return;
        }

        let bytes;

        if (rtdType === RtdType.URL) {
            bytes = buildUrlPayload(urlToWrite);
        } else if (rtdType === RtdType.TEXT) {
            bytes = buildTextPayload(urlToWrite);
        }

        this.setState({ isWriting: true });
        NfcManager.setNdefPushMessage(bytes)
            .then(() => console.log('beam request completed'))
            .catch(err => console.warn(err))
    }

    _cancelAndroidBeam = () => {
        this.setState({ isWriting: false });
        NfcManager.setNdefPushMessage(null)
            .then(() => console.log('beam cancelled'))
            .catch(err => console.warn(err))
    }

    _startNfc() {
        NfcManager.start({
            onSessionClosedIOS: () => {
                console.log('ios session closed');
            }
        })
            .then(result => {
                console.log('start OK', result);
            })
            .catch(error => {
                console.warn('start fail', error);
                this.setState({ supported: false });
            })

        if (Platform.OS === 'android') {
            NfcManager.getLaunchTagEvent()
                .then(tag => {
                    console.log('launch tag', tag);
                    if (tag) {
                        this.setState({ tag });
                    }
                })
                .catch(err => {
                    console.log(err);
                })
            NfcManager.isEnabled()
                .then(enabled => {
                    this.setState({ enabled });
                })
                .catch(err => {
                    console.log(err);
                })
            NfcManager.onStateChanged(
                event => {
                    if (event.state === 'on') {
                        this.setState({ enabled: true });
                    } else if (event.state === 'off') {
                        this.setState({ enabled: false });
                    } else if (event.state === 'turning_on') {
                        // do whatever you want
                    } else if (event.state === 'turning_off') {
                        // do whatever you want
                    }
                }
            )
                .then(sub => {
                    this._stateChangedSubscription = sub;
                    // remember to call this._stateChangedSubscription.remove()
                    // when you don't want to listen to this anymore
                })
                .catch(err => {
                    console.warn(err);
                })
        }
    }

    _onTagDiscovered = tag => {
        console.log('Tag Discovered', tag);
        if (this.state.isWriting) {
            return;
        }
        // if (this.loaded) {
        //     Alert.alert(title, 'Are you sure to overwrite?', [{
        //         text: 'YES', onPress: () => {
        //             // let url = this._parseUri(tag);
        //             // if (url) {
        //             //     Linking.openURL(url)
        //             //         .catch(err => {
        //             //             console.warn(err);
        //             //         })
        //             // }
        //             let text = this._parseText(tag);
        //             this.setState({ productInfor: JSON.parse(text) }, () => {
        //                 this.loaded = true;
        //             });
        //         }
        //     }, {
        //         text: 'NO', onPress: () => { }
        //     }])
        // }
        // else {
            let text = this._parseText(tag);
            this.setState({ productInfor: JSON.parse(text) }, () => {
                this.loaded = true;
            });
        // }
    }


    _startDetection = () => {
        NfcManager.registerTagEvent(this._onTagDiscovered)
            .then(result => {
                console.log('registerTagEvent OK', result)
            })
            .catch(error => {
                console.warn('registerTagEvent fail', error)
            })
    }

    _stopDetection = () => {
        NfcManager.unregisterTagEvent()
            .then(result => {
                console.log('unregisterTagEvent OK', result)
            })
            .catch(error => {
                console.warn('unregisterTagEvent fail', error)
            })
    }

    _clearMessages = () => {
        this.setState({ productInfor: {} });
    }

    _goToNfcSetting = () => {
        if (Platform.OS === 'android') {
            NfcManager.goToNfcSetting()
                .then(result => {
                    console.log('goToNfcSetting OK', result)
                })
                .catch(error => {
                    console.warn('goToNfcSetting fail', error)
                })
        }
    }

    _parseUri = (tag) => {
        if (!tag.ndefMessage) {
            console.log('no messages in tag');
            return null;
        }
        try {
            if (Ndef.isType(tag.ndefMessage[0], Ndef.TNF_WELL_KNOWN, Ndef.RTD_URI)) {
                return Ndef.uri.decodePayload(tag.ndefMessage[0].payload);
            }
        } catch (e) {
            console.log(e);
        }
        return null;
    }

    _parseText = (tag) => {
        if (!tag.ndefMessage) {
            console.log('no messages in tag');
            return null;
        }
        try {
            if (Ndef.isType(tag.ndefMessage[0], Ndef.TNF_WELL_KNOWN, Ndef.RTD_TEXT)) {
                return Ndef.text.decodePayload(tag.ndefMessage[0].payload);
            }
        } catch (e) {
            console.log(e);
        }
        return null;
    }
}

export default App;

var styles = StyleSheet.create({
    header: {
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: '#fff',
        // borderBottomColor: '#000',
        height: 40,
        marginBottom: 10,
        width: '100%',
    },
    label: {
        fontSize: 13,
        paddingRight: 10,
        width: 100,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#fff',
        fontSize: 13,
        borderWidth: 1,
        width: 200,
        height: 40,
        textAlign: 'left',
        borderBottomColor: '#808080',
    },
    footer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    button: {
        elevation: 4,
        backgroundColor: '#2196F3',
        borderRadius: 2,
        // marginLeft: 10,
        marginRight: 10,
        marginTop: 20,
        borderWidth: 1,
        // borderColor: 'blue', 
        // padding: 10
    },
    buttonlabel: {
        textAlign: 'center',
        padding: 8,
        color: 'white',
        fontWeight: '500',
    },
});
