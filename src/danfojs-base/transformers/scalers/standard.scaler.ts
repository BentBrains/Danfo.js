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

import tensorflow from '../../shared/tensorflowlib'
import Series from "../../core/series"
import DataFrame from "../../core/frame"
import Utils from "../../shared/utils"

const utils = new Utils()

/**
 * Standardize features by removing the mean and scaling to unit variance.
 * The standard score of a sample x is calculated as: `z = (x - u) / s`, 
 * where `u` is the mean of the training samples, and `s` is the standard deviation of the training samples.
 */
export default class StandardScaler {
    private $std: typeof tensorflow.Tensor
    private $mean: typeof tensorflow.Tensor

    constructor() {
        this.$std = tensorflow.tensor1d([])
        this.$mean = tensorflow.tensor1d([])
    }

    private $getTensor(data: number[] | number[][] | typeof tensorflow.Tensor | DataFrame | Series) {
        let $tensorArray

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
            throw new Error("ParamError: data must be one of Array, DataFrame or Series")
        }
        return $tensorArray
    }
    /**
     * Fit a StandardScaler to the data.
     * @param data Array, Tensor, DataFrame or Series object
     * @returns StandardScaler
     * @example
     * const scaler = new StandardScaler()
     * scaler.fit([1, 2, 3, 4, 5])
     */
    public fit(data: number[] | number[][] | typeof tensorflow.Tensor | DataFrame | Series) {
        const tensorArray = this.$getTensor(data)
        this.$std = tensorflow.moments(tensorArray, 0).variance.sqrt();
        this.$mean = tensorArray.mean(0);
        return this
    }

    /**
     * Transform the data using the fitted scaler
     * @param data Array, Tensor, DataFrame or Series object
     * @returns Array, Tensor, DataFrame or Series object
     * @example
     * const scaler = new StandardScaler()
     * scaler.fit([1, 2, 3, 4, 5])
     * scaler.transform([1, 2, 3, 4, 5])
     * // [0.0, 0.0, 0.0, 0.0, 0.0]
     * */
    public transform(data: number[] | number[][] | typeof tensorflow.Tensor | DataFrame | Series) {
        const tensorArray = this.$getTensor(data)
        const outputData = tensorArray.sub(this.$mean).div(this.$std)

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
     * Fit and transform the data using the fitted scaler
     * @param data Array, Tensor, DataFrame or Series object
     * @returns Array, Tensor, DataFrame or Series object
     * @example
     * const scaler = new StandardScaler()
     * scaler.fit([1, 2, 3, 4, 5])
     * scaler.fitTransform([1, 2, 3, 4, 5])
     * // [0.0, 0.0, 0.0, 0.0, 0.0]
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
     * const scaler = new StandardScaler()
     * scaler.fit([1, 2, 3, 4, 5])
     * scaler.transform([1, 2, 3, 4, 5])
     * // [0.0, 0.0, 0.0, 0.0, 0.0]
     * scaler.inverseTransform([0.0, 0.0, 0.0, 0.0, 0.0])
     * // [1, 2, 3, 4, 5]
     * */
    public inverseTransform(data: number[] | number[][] | typeof tensorflow.Tensor | DataFrame | Series) {
        const tensorArray = this.$getTensor(data)
        const outputData = tensorArray.mul(this.$std).add(this.$mean)

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


