/**
*  @license
* Copyright 2022 JsData. All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.

* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* ==========================================================================
*/

import Series from "../../core/series"
import DataFrame from "../../core/frame"
import Utils from "../../shared/utils"
import tensorflow from '../../shared/tensorflowlib'

const utils = new Utils()

/**
 * Transform features by scaling each feature to a given range.
 * This estimator scales and translates each feature individually such 
 * that it is in the given range on the training set, e.g. between the maximum and minimum value.
*/
export default class MinMaxScaler {
    private $max: typeof tensorflow.Tensor
    private $min: typeof tensorflow.Tensor

    constructor() {
        this.$max = tensorflow.tensor1d([])
        this.$min = tensorflow.tensor1d([])
    }

    private $getTensor(data: number[] | number[][] | typeof tensorflow.Tensor | DataFrame | Series) {
        let $tensorArray: typeof tensorflow.Tensor

        if (data instanceof Array) {
            if (utils.is1DArray(data)) {
                $tensorArray = tensorflow.tensor1d(data as number[])
            } else {
                $tensorArray = tensorflow.tensor2d(data)
            }
        } else if (data instanceof DataFrame || data instanceof Series) {
            $tensorArray = data.tensor 
        } else if (data instanceof tensorflow.Tensor) {
            $tensorArray = data
        } else {
            throw new Error("ParamError: data must be one of Array, Tensor, DataFrame or Series")
        }
        return $tensorArray
    }

    /**
     * Fits a MinMaxScaler to the data
     * @param data Array, Tensor, DataFrame or Series object
     * @returns MinMaxScaler
     * @example
     * const scaler = new MinMaxScaler()
     * scaler.fit([1, 2, 3, 4, 5])
     * // MinMaxScaler {
     * //   $max: [5],
     * //   $min: [1]
     * // }
     *
     */
    public fit(data: number[] | number[][] | typeof tensorflow.Tensor | DataFrame | Series) {
        const tensorArray = this.$getTensor(data)
        this.$max = tensorArray.max(0)
        this.$min = tensorArray.min(0)
        return this
    }

    /**
     * Transform the data using the fitted scaler
     * @param data Array, Tensor, DataFrame or Series object
     * @returns Array, Tensor, DataFrame or Series object
     * @example
     * const scaler = new MinMaxScaler()
     * scaler.fit([1, 2, 3, 4, 5])
     * scaler.transform([1, 2, 3, 4, 5])
     * // [0, 0.25, 0.5, 0.75, 1]
     * */
    public transform(data: number[] | number[][] | typeof tensorflow.Tensor | DataFrame | Series) {
        const tensorArray = this.$getTensor(data)
        const outputData = tensorArray
            .sub(this.$min)
            .div(this.$max.sub(this.$min))

        if (Array.isArray(data)) {
            return outputData.arraySync()

        } else if (data instanceof Series) {
            return new Series(outputData, {
                index: data.index,
            });

        } else if (data instanceof DataFrame) {
            return new DataFrame(outputData, {
                index: data.index,
                columns: data.columns,
                config: { ...data.config },
            });
        } else {
            return outputData
        }
    }

    /**
     * Fit the data and transform it
     * @param data Array, Tensor, DataFrame or Series object
     * @returns Array, Tensor, DataFrame or Series object
     * @example
     * const scaler = new MinMaxScaler()
     * scaler.fitTransform([1, 2, 3, 4, 5])
     * // [0, 0.25, 0.5, 0.75, 1]
     * */
    public fitTransform(data: number[] | number[][] | typeof tensorflow.Tensor | DataFrame | Series) {
        this.fit(data)
        return this.transform(data)
    }

    /**
     * Inverse transform the data using the fitted scaler
     * @param data Array, Tensor, DataFrame or Series object
     * @returns Array, Tensor, DataFrame or Series object
     * @example
     * const scaler = new MinMaxScaler()
     * scaler.fit([1, 2, 3, 4, 5])
     * scaler.inverseTransform([0, 0.25, 0.5, 0.75, 1])
     * // [1, 2, 3, 4, 5]
     * */
    public inverseTransform(data: number[] | number[][] | typeof tensorflow.Tensor | DataFrame | Series) {
        const tensorArray = this.$getTensor(data)
        const outputData = tensorArray
            .mul(this.$max.sub(this.$min))
            .add(this.$min)

        if (Array.isArray(data)) {
            return outputData.arraySync()

        } else if (data instanceof Series) {
            return new Series(outputData, {
                index: data.index,
            });

        } else if (data instanceof DataFrame) {
            return new DataFrame(outputData, {
                index: data.index,
                columns: data.columns,
                config: { ...data.config },
            });
        } else {
            return outputData
        }
    }

}


