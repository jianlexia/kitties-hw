/* ticket */

import React, { useEffect, useState } from 'react';
import { Form, Grid } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

import KittyCards from './KittyCards';

export default function Kitties(props) {
  const { api, keyring } = useSubstrate();
  const { accountPair } = props;

  const [kittyCnt, setKittyCnt] = useState(0);
  const [kittyDNAs, setKittyDNAs] = useState([]);
  const [kittyOwners, setKittyOwners] = useState([]);
  const [kitties, setKitties] = useState([]);
  const [status, setStatus] = useState('');
  const [kittyPrices, setKittyPrices] = useState([]);//
  const [preDNAs, setPreDNAs] = useState([]);
  const [creaters, setCreaters] = useState([]);//setIsValids
  const [isInvalids, setIsInvalids] = useState([]);
  

  const fetchKittyCnt = () => {
    /* TODO: 加代码，从 substrate 端读取数据过来1 2*/
    api.query.kittiesModule.kittiesCount(amount => {
      //获取猫咪总数/ID
      let kittyCount = amount.toJSON();
      setKittyCnt(kittyCount);

    })
  };

  const fetchKittiesOwner = () => {
    //获取猫咪的主人
    api.query.kittiesModule.kittyOwners.multi([...Array(kittyCnt).keys()], (data) => {
      let tempData = [];
      data.map(row => {
        if (row.isNone) {
          tempData.push('猫不存在');
        } else {
          let kittyOwner = row.value.toHuman();

          tempData.push(kittyOwner);
        }
      })
      setKittyOwners(tempData);
    })
   // debugger;
  }

  const fetchKittiesPreDNA = () => {
    //获取猫咪的主人
    api.query.kittiesModule.kittyPre.multi([...Array(kittyCnt).keys()], (data) => {
      let tempData = [];
      data.map(row => {
        if (row.isNone) {
          tempData.push(' ');
        } else {
          let preDNA = row.value.toHuman();

          tempData.push(preDNA);
        }
      })
      setPreDNAs(tempData);
    })
    console.log("predna=" + preDNAs);
  }

  const fetchKitties = () => {

    api.query.kittiesModule.kitties.multi([...Array(kittyCnt).keys()], (data) => {
      let tempData = [];
      data.map(row => {
        if (row.isNone) {
          tempData.push('no kitty');
        } else {
          let kittyDna = row.value.toHuman();
          tempData.push(kittyDna);
        }
      })
      setKittyDNAs(tempData);
    });
    api.query.kittiesModule.ticketCreater.multi([...Array(kittyCnt).keys()], (data) => {
      let tempData = [];
      data.map(row => {
        if (row.isNone) {
          tempData.push(' ');
        } else {
          let creater = row.value.toHuman();
          tempData.push(creater);
        }
      })
      setCreaters(tempData);
    });

    api.query.kittiesModule.isInvalid.multi([...Array(kittyCnt).keys()], (data) => {
      let tempData = [];
      data.map(row => {
        if (row.isNone) {
          tempData.push(false);
        } else {
          let invalid = row.value.toHuman();
          tempData.push(invalid);
        }
      })
      console.log("invalid ==", tempData);
      setIsInvalids(tempData);
    });
  }

  const fetchKittiesPrice = () => {
    api.query.kittiesModule.priceAmount.multi([...Array(kittyCnt).keys()], (data) => {
      let tempData = [];
      data.map(row => {
        let price = 0;
        if (null != row && null != row.words)
        {
            price = row.words;
        }
        tempData.push(price[0]);
        
      })
      setKittyPrices(tempData);
    })
  }

  const populateKitties = () => {
    /* TODO: 加代码，从 substrate 端读取数据过来 */
    let kittiesAllInfo = [];

    for (let idx = 0; idx < kittyCnt; idx++) {
      if(accountPair.address == kittyOwners[idx])
      {
        kittiesAllInfo.push({
        id: idx,
        dna: kittyDNAs[idx],
        owner: kittyOwners[idx],
        price:kittyPrices[idx],
        preDna:preDNAs[idx],
        creater:creaters[idx],
        invalid:isInvalids[idx]
        })
      }
      
    }

    setKitties(kittiesAllInfo);
    console.log("kitties=", kitties);
  };

  useEffect(fetchKittyCnt, [api, keyring]);
  useEffect(fetchKitties, [api, kittyCnt]);
  useEffect(fetchKittiesOwner, [api, kittyCnt]);
  useEffect(fetchKittiesPrice, [api, kittyCnt]);
  useEffect(fetchKittiesPreDNA, [api, kittyCnt]);
  useEffect(populateKitties, [kittyDNAs, kittyOwners,kittyPrices, preDNAs, accountPair]);

  

  return <Grid.Column width={16}>
    <h1>我的票据</h1>
    <KittyCards kitties={kitties} accountPair={accountPair} setStatus={setStatus} />
    <Form style={{ margin: '1em 0' }}>
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          accountPair={accountPair} label='create ticket' type='SIGNED-TX' setStatus={setStatus}
          attrs={{
            palletRpc: 'kittiesModule',
            callable: 'create',
            inputParams: [100],
            paramFields: ['price']
          }}
        />
      </Form.Field>
    </Form>
    <div style={{ overflowWrap: 'break-word' }}>{status}</div>
  </Grid.Column>;
}