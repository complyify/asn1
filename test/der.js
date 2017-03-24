import { isEqual } from 'lodash';

import ASN1 from '../src';

import {
  pkcs10DER,
  pkcs10Obj,
  rsaPrivateKeyDER,
} from './resources';

describe('DER', () => {
  let pkcs10GeneratedObj;
  let rsaPrivateKeyGeneratedObj;
  describe('deserializing', () => {
    it('should deserialize a DER-encoded pkcs#10', () => {
      pkcs10GeneratedObj = ASN1.deserialize(pkcs10DER, ASN1.Encodings.DER);
      isEqual(pkcs10GeneratedObj, pkcs10Obj).should.be.true;
    });
    it('should deserialize a DER-encoded RSA private key', () => {
      rsaPrivateKeyGeneratedObj = ASN1.deserialize(rsaPrivateKeyDER, ASN1.Encodings.DER);
      rsaPrivateKeyGeneratedObj.should.be.an.array;
      rsaPrivateKeyGeneratedObj.length.should.equal(1);
      rsaPrivateKeyGeneratedObj[0].children.should.be.an.array;
      rsaPrivateKeyGeneratedObj[0].children.length.should.equal(9);
      rsaPrivateKeyGeneratedObj[0].children[0].content.should.equal(0);
      rsaPrivateKeyGeneratedObj[0].children[1].content.toString().should.equal('139196776859253058353935429392598205656573017367730067745056834729243863307441937974617441536788548010158689760831040280476733265749340370575094865498830135964757775019706390745791247373604384646459212454437297153771803232088952178125437483002833438613717753872370785254674362096971832896247931183554727874231');
      rsaPrivateKeyGeneratedObj[0].children[2].content.should.equal(65537);
      rsaPrivateKeyGeneratedObj[0].children[3].content.toString().should.equal('107783676934808046634529521268690680721639850959918790116398358057355971913007248217005833432525267343203427518697724966253456567083964413775033021643791014423730202670101843301910329237387526711110571184357730332962530376830246286122916730235079705150077261201126054539812640005065425848448437889818738690745');
      rsaPrivateKeyGeneratedObj[0].children[4].content.toString().should.equal('11928492495783447772105052087990037125749747970353362199773158921309407789468104965158778037590178702923332706989524776016765594549550145857850719948492997');
      rsaPrivateKeyGeneratedObj[0].children[5].content.toString().should.equal('11669268091375095111350115137328457275290467454217865201764490444077954896115864411990620515425229296000513490854740762022238150633222355541045506451054923');
      rsaPrivateKeyGeneratedObj[0].children[6].content.toString().should.equal('6669450089613392079485564240966460631381479391453045624399772073081475038977673226395976374130901905964869926640175112800133385432338465213073896136115917');
      rsaPrivateKeyGeneratedObj[0].children[7].content.toString().should.equal('3641961175229049169286895265558635047511958455659737474051160223128469253172313207544687001579377146045661274424262135074886844577138563868296455268777597');
      rsaPrivateKeyGeneratedObj[0].children[8].content.toString().should.equal('2550813609286433675938410475674177695124308827204806470622606844022393706595680681334070210920517875584818102390557812022265647921794857175471999104605351');
    });
  });
  describe('serializing', () => {
    it('should serialize a PKCS#10 object', () => {
      const der = ASN1.serialize(pkcs10Obj, ASN1.Encodings.DER);
      der.equals(pkcs10DER).should.be.true;
    });
    it('should serialize a RSA private key object', () => {
      const der = ASN1.serialize(rsaPrivateKeyGeneratedObj, ASN1.Encodings.DER);
      der.equals(rsaPrivateKeyDER).should.be.true;
    });
  });
});
