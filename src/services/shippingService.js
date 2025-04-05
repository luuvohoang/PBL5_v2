import axios from 'axios';

const GHN_API_URL = 'https://online-gateway.ghn.vn/shiip/public-api';
const GHN_TOKEN = 'a61dcfd9-03ab-11f0-aff4-822fc4284d92';
const GHN_SHOP_ID = '5690014';

const ghnAxios = axios.create({
    baseURL: GHN_API_URL,
    headers: {
        'token': GHN_TOKEN,
        'Content-Type': 'application/json',
    }
});

export const getProvinces = async () => {
    const response = await ghnAxios.get('/master-data/province');
    return response.data.data;
};

export const getDistricts = async (provinceId) => {
    const response = await ghnAxios.get(`/master-data/district`, {
        params: { province_id: provinceId }
    });
    return response.data.data;
};

export const getWards = async (districtId) => {
    const response = await ghnAxios.get(`/master-data/ward`, {
        params: { district_id: districtId }
    });
    return response.data.data;
};

export const calculateShippingFee = async (params) => {
    const response = await ghnAxios.get('/v2/shipping-order/fee', {
        params: {
            service_type_id: params.serviceTypeId,
            insurance_value: params.insuranceValue,
            to_ward_code: params.toWardCode,
            to_district_id: params.toDistrictId,
            from_district_id: params.fromDistrictId,
            weight: params.weight
        },
        headers: {
            'shop_id': GHN_SHOP_ID
        }
    });
    return response.data.data;
};
