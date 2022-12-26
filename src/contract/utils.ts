import {ethers} from "ethers";

export function calculateReleaseAmount(_releaseFrequency: number, _releaseFrequencyType: number, _startTime: number, _stopTime: number, _releaseAmount: number, tokenDecimal: number, fee: string) {
    let correctAmount = 0;
    let releaseFrequency = _releaseFrequency;
    if (!_releaseFrequency || releaseFrequency <= 0) {
        return correctAmount;
    }

    let releaseFrequencyType = _releaseFrequencyType;
    let releaseTime = releaseFrequency;
    if (releaseFrequencyType === 1) {
        releaseTime = releaseTime * 60;
    } else if (releaseFrequencyType === 2) {
        releaseTime = releaseTime * 60 * 60;
    } else if (releaseFrequencyType === 3) {
        releaseTime = releaseTime * 60 * 60 * 24;
    } else if (releaseFrequencyType === 4) {
        releaseTime = releaseTime * 60 * 60 * 24 * 7;
    } else if (releaseFrequencyType === 5) {
        releaseTime = releaseTime * 60 * 60 * 24 * 30;
    } else if (releaseFrequencyType === 6) {
        releaseTime = releaseTime * 60 * 60 * 24 * 365;
    }
    let startTimeInSecond = _startTime
    let stopTimeInSecond = _stopTime

    let delta = stopTimeInSecond - startTimeInSecond;
    let releaseAmount = ethers.utils.parseUnits(_releaseAmount.toString(), tokenDecimal);
    let bigReleaseTime = ethers.BigNumber.from(releaseTime);
    let bigDelta = ethers.BigNumber.from(delta);
    if (!_releaseAmount || releaseAmount.lte(0)) {
        return correctAmount;
    }
    // Hard code transaction fee 2.5%, will edit later.
    // @ts-ignore
    let denominator = ethers.BigNumber.from("10000");
    let numerator = denominator.add(fee);
    return (releaseAmount.mul(numerator).div(denominator).mul(bigReleaseTime).div(bigDelta)).mul(bigDelta.div(bigReleaseTime));
}

export function calculateReleaseFrequency(frequency: number, type: number) {
    if (type == 1) {
        return frequency * 60;
    } else if (type == 2) {
        return frequency * 3600;
    } else if (type == 3) {
        return frequency * 3600 * 24;
    } else if (type == 4) {
        return frequency * 3600 * 24 * 7;
    } else if (type == 5) {
        return frequency * 3600 * 24 * 30;
    } else if (type == 6) {
        return frequency * 3600 * 24 * 365;
    }
    return frequency;
}