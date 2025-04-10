import { useEffect, useState } from 'react'
import api from '../../../utils/api'
import useFlashMessage from '../../../hooks/useFlashMessage'
import { useNavigate, useParams } from 'react-router'
import { Button, Container, Data, Input, Label, Header, Box, TwoButtons } from './../../../styles/form'
import Loader from '../../Loader/Loader'


export default function EditItem(props) {

    const [item, setItem] = useState({})
    const [token] = useState(localStorage.getItem('token') || '')
    const { id } = useParams()
    const { setFlashMessage } = useFlashMessage()
    const [loading, setLoading] = useState(true)
    const [reqUpdateLoading, setReqUpdateLoading] = useState(false)
    const [reqDeleteLoading, setReqDeleteLoading] = useState(false)

    useEffect(() => {
        api.get(`/items/${id}`, {

            Authorization: `Bearer ${JSON.parse(token)}`,

        })
            .then((response) => {
                setItem(response.data.item)
                setLoading(false)
            })

    }, [token, id])

    async function updateItem(item) {
        setReqUpdateLoading(true)
        let msgType = 'sucess'
        const formData = new FormData()

        await Object.keys(item).forEach((key) => {
            if (key === 'images') {
                for (let i = 0; i < item[key].length; i++) {
                    formData.append('images', item[key][i])
                }

            } else {
                formData.append(key, item[key])
            }
        })

        const data = await api.patch(`items/${item._id}`, formData, {
            headers: {
                Authorization: `Bearer ${JSON.parse(token)}`,
                'Content-Type': 'multipart/form-data'
            }
        }).then((response) => {
            setReqUpdateLoading(false)
            return response.data
        }).catch((err) => {
            msgType = 'error'
            setReqUpdateLoading(false)
            return err.response.data

        })

        setFlashMessage(data.message, msgType)

    }


    const [items, setItems] = useState([])
    const navigate = useNavigate()

    async function removeItem(id) {
        setReqDeleteLoading(true)
        let msgType = "success"
        const data = await api.delete(`/items/${id}`, {
            headers: {
                Authorization: `Bearer ${JSON.parse(token)}`,
            }
        }).then((response) => {
            const updatedItems = items.filter((item) => item._id !== id)
            setItems(updatedItems)
            navigate('/myitems')
            setReqDeleteLoading(false)
            return response.data
        }).catch((err) => {
            setReqDeleteLoading(false)
            msgType = 'error'
            return err.response.data
        })

        setFlashMessage(data.message, msgType)

    }

    //////////////////PetForm//////////////////
    const [preview, setPreview] = useState([])

    function onFileChange(e) {
        const files = e.target.files;
        let imagesArray = [];

        const loadAndSetImages = async () => {
            try {
                const promises = Array.from(files).map(file => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (event) => resolve(event.target.result);
                        reader.onerror = (error) => reject(error);
                        reader.readAsDataURL(file);
                    });
                });

                const imageUrls = await Promise.all(promises);
                imagesArray = imageUrls;

                setItem(prevItem => {
                    return { ...prevItem, images: imagesArray };
                });

            } catch (error) {
                console.error("Error loading images", error);
            }
        };
        loadAndSetImages();
    }

    function handleChange(e) {
        setItem({ ...item, [e.target.name]: e.target.value })
    }

    function submit(e) {
        e.preventDefault()
        updateItem(item)
    }



    return (
        <Container>
            {!loading ? (
                <Box>

                    <Header>
                        <h1>Editando o Item: {item.title} </h1>
                    </Header>

                    <form onSubmit={submit}>

                        <Data>
                            <Label for="title">Nome</Label>
                            <Input type="text" name="title" maxLength="20" placeholder="Digite o nome do produto" onChange={handleChange} value={item.title} />
                            <br />

                            <Label for="short_desc" >Breve descrição</Label>
                            <Input type="text" name="short_desc" maxLength="120" placeholder="Digite uma Breve Descrição" onChange={handleChange} value={item.short_desc} />
                            <br />

                            <Label for="long_desc" >Descrição completa</Label>
                            <Input type="text" name="long_desc" maxLength='970' placeholder="Digite a Descrição Completa" onChange={handleChange} value={item.long_desc} />
                            <br />

                            <Label for="brand" >Marca</Label>
                            <Input type="text" name="brand" maxLength='30' placeholder="Digite a Marca do Produto" onChange={handleChange} value={item.brand} />
                            <br />

                            <Label for="price" >Preço</Label>
                            <Input type="number" name="price" step='any' placeholder="Digite o valor em R$:" onChange={handleChange} value={item.price} />
                            <br />

                            <Label for="images" >Imagens</Label>
                            <Input type="file" name="images" placeholder="Digite o valor em R$:" multiple='true' onChange={onFileChange} />
                            <br />


                        </Data>

                        <TwoButtons>
                            <Button type="submit"disabled={reqUpdateLoading || reqDeleteLoading}>{!reqUpdateLoading ? "Atualize o produto" : "Atualizando o produto..."}</Button>
                            <Button onClick={() => { removeItem(item._id) }} disabled={reqDeleteLoading || reqUpdateLoading}>{!reqDeleteLoading ? "Excluir o produto" : "Excluindo o produto..."}</Button>
                        </TwoButtons>

                    </form>

                </Box>

            ) : (
                <Loader />
            )}

        </Container>
    )

}














